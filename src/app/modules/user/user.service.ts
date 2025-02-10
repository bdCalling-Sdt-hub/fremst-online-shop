import mongoose, { Types } from 'mongoose'
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
import { emailTemplate } from '../../../shared/emailTemplate'
import { emailHelper } from '../../../helpers/emailHelper'
import { USER_STATUS } from './user.constants'




const createUserToDB = async (
  user: JwtPayload,
  payload: IUser & IEmployee & ICompany,
): Promise<IUser | IEmployee | ICompany | null> => {
  const session = await mongoose.startSession();
  let createdUser: IUser | IEmployee | ICompany | null = null;

  try {
    session.startTransaction();

    //check if the mail already exist
    const isExistUser = await User.findOne({ email: payload.email, status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED] } })
    if(isExistUser){
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!')
    }

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

        //check if the end data exceed the current year if so set the end date to the end of the year 31 december
        if (endDate.getFullYear() !== startDate.getFullYear()) {
          endDate.setFullYear(startDate.getFullYear());
          endDate.setMonth(11); // December (zero-indexed, so 11 = December)
          endDate.setDate(31); // Set to the 31st day of December
        }

        const companyId = user.role === USER_ROLES.COMPANY ? user.userId : company;

        const employeeDoc = await Employee.create(
          [
            {
              company: companyId,
              designation,
              user: userDoc[0]._id,
              budget,
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
        await Company.findByIdAndUpdate(
           new Types.ObjectId(companyId),
          {
            $inc: {
              totalEmployees: 1,
              totalBudget: budget,
            },
          },
          { session },
        );


        
        //send email with credentials to the new employee
        const createAccount = emailTemplate.createAccountCredentials({
          to: payload.email,
          username: payload.email,
          password: payload.password
        });
        await emailHelper.sendEmail(createAccount);

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
        //send email with credentials to the new employee
        const createCompany = emailTemplate.createAccountCredentials({
          to: payload.email,
          username: payload.email,
          password: payload.password
        });
        await emailHelper.sendEmail(createCompany);
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
  select:{_id:1, user:1},
  populate:{
    path:'user',
    select:'name email address contact status profile'
  }
    })
    .lean();
    if (!employee) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found')
    }
    return employee

}else{
 
  const admins = await User.findById(user.authId)
  if(!admins){
    throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found')
  }
  return admins
}

 
}

const deleteAdmin = async (user: JwtPayload,id:Types.ObjectId) => {
  if(user.role !== USER_ROLES.SUPER_ADMIN){
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You do not have permission to delete this admin')
  }
  const admin = await User.findByIdAndDelete(id)
  if (!admin) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Admin not found')
  }
  return admin
}

const deleteUser = async (user: JwtPayload, id:Types.ObjectId) => {
  if(user.role !== USER_ROLES.SUPER_ADMIN && user.role !== USER_ROLES.ADMIN && user.role !== USER_ROLES.COMPANY){
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You do not have permission to delete this user')
  }
  const deletedUser = await User.findByIdAndUpdate(id,{status: USER_STATUS.DELETED},)
  if (!deletedUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }
  return deletedUser
}


export const UserServices = {
  createUserToDB,
  updateUserToDB,
  getUserProfileFromDB,
  deleteAdmin,
  deleteUser
}
