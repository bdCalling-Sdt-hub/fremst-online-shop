import mongoose from 'mongoose'
import { USER_ROLES } from '../../../enum/user'
import { IUser } from './user.interface'
import { User } from './user.model'
import ApiError from '../../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'
import { Employee } from '../employee/employee.model'
import { IEmployee } from '../employee/employee.interface'
import { JwtPayload } from 'jsonwebtoken'
import { Company } from '../company/company.model'
import { ICompany } from '../company/company.interface'




const createUserToDB = async (
  user: JwtPayload,
  payload: IUser & IEmployee & ICompany,
): Promise<IUser | IEmployee | ICompany | null> => {
  const session = await mongoose.startSession();
  let createdUser: IUser | IEmployee | ICompany | null = null;

  try {
    session.startTransaction();

    // Validate roles
    if (
      (payload.role === USER_ROLES.SUPER_ADMIN && user.role !== USER_ROLES.SUPER_ADMIN) ||
      (payload.role === USER_ROLES.ADMIN && user.role !== USER_ROLES.SUPER_ADMIN)
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Only Super Admin can create Super Admin or Admin');
    }

    // Create User document
    const userDoc = await User.create([payload], { session });
    if (!userDoc || userDoc.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user.');
    }

    // Handle role-specific logic
    switch (payload.role) {
      case USER_ROLES.SUPER_ADMIN:
      case USER_ROLES.ADMIN:
        createdUser = userDoc[0];
        break;

      case USER_ROLES.EMPLOYEE:
        if (user.role !== USER_ROLES.COMPANY && user.role !== USER_ROLES.SUPER_ADMIN) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Only Company or Super Admin can create employees.');
        }

        const { designation, budget, duration, company, ...userData } = payload;
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + duration);

        const companyId = user.role === USER_ROLES.COMPANY ? user.authId : company;

        const employeeDoc = await Employee.create(
          [
            {
              company: companyId,
              designation,
              user: userDoc[0]._id,
              budget,
              totalBudget: budget,
              budgetLeft: budget,
              duration,
              budgetExpiredAt: endDate.toISOString(),
              createdBy: user.authId,
            },
          ],
          { session },
        );

        if (!employeeDoc || employeeDoc.length === 0) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create employee.');
        }

        createdUser = employeeDoc[0];

        // Update company budget and employee count
        await Company.updateOne(
          { _id: companyId },
          {
            $inc: {
              totalEmployees: 1,
              totalBudget: budget,
            },
          },
          { session },
        );
        break;

      case USER_ROLES.COMPANY:
        if (user.role !== USER_ROLES.SUPER_ADMIN && user.role !== USER_ROLES.ADMIN) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Only Super Admin or Admin can create companies.');
        }

        const companyDoc = await Company.create(
          [
            {
              user: userDoc[0]._id,
              createdBy: user.authId,
            },
          ],
          { session },
        );

        if (!companyDoc || companyDoc.length === 0) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create company.');
        }

        createdUser = companyDoc[0];
        break;

      default:
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid role specified.');
    }

    await session.commitTransaction();
    return createdUser;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};


const updateUserToDB = async (user: JwtPayload, payload: Partial<IUser>) => {


  const updatedUser = await User.findByIdAndUpdate(user.authId, { $set: payload }, {
    new: true,
  }).lean()

  if (!updatedUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to update profile')
  }
  return updatedUser
}


const getUserProfileFromDB = async (user: JwtPayload) => {

  

if (user.role === USER_ROLES.COMPANY) {
  const company = await Company.findById(user.userId)
    .populate('user', 'name email address contact status role profile')
    .lean();
    if (!company) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found')
    }
    return company
} else if (user.role === USER_ROLES.EMPLOYEE) {
  const employee = await Employee.findById(user.userId)
    .populate({
      path: 'user',
      select: 'name email address contact status role profile'
    })
    .populate({
      path: 'company',
      select: 'name address phone email profile'
    })
    .lean();
    if (!employee) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found')
    }
    return employee

}else{
  console.log(user.authId)
  const admins = await User.findById(user.authId)
  if(!admins){
    throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found')
  }
  return admins
}

 
}
export const UserServices = {
  createUserToDB,
  updateUserToDB,
  getUserProfileFromDB
}
