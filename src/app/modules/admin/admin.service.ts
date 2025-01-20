import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { IGenericResponse } from '../../../interfaces/response'
import { ICompany, ICompanyFilters } from '../company/company.interface'
import { Company } from '../company/company.model'
import { IEmployee, IEmployeeFilters } from '../employee/employee.interface'
import { Employee } from '../employee/employee.model'
import { User } from '../user/user.model'
import { AdminModel } from './admin.interface'
import { IUser } from '../user/user.interface'
import mongoose, { Types } from 'mongoose'




//company profile information 
const getCompanyProfileInformation = async (company_id: string) => {
  const company = await Company.findById(company_id,{user:1, totalEmployees:1, totalOrders:1, totalBudget:1, totalSpentBudget:1}).populate({
    path: 'user',
    select: {
      name: 1,
      email: 1,
      address: 1,
      contact: 1,
      status: 1,},
  })
  
  return company
}

const getCompaniesFromDB = async (
  filters: ICompanyFilters,
  paginationOptions: IPaginationOptions,
): Promise<IGenericResponse<ICompany[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions)

  const { searchTerm } = filters

  const result = await Company.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    {
      $unwind: '$createdBy',
    },
    {
      $match: {
        ...(searchTerm && {
          $or: [
            { 'user.name': { $regex: searchTerm, $options: 'i' } },
            { 'user.address': { $regex: searchTerm, $options: 'i' } },
            { 'user.phone': { $regex: searchTerm, $options: 'i' } },
            { 'user.email': { $regex: searchTerm, $options: 'i' } },
          ],
        }),
      },
    },
    {
      $project: {
        'user._id': 1,
        'user.name': 1,
        'user.profile': 1,
        'user.email': 1,
        'user.address': 1,
        'user.phone': 1,
        'user.status': 1,
        'createdBy._id': 1,
        'createdBy.name': 1,
        totalEmployees: 1,
        _id: 1,
      },
    },

    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $sort: {
        [sortBy]: sortOrder === 'asc' ? 1 : -1,
      },
    },
  ])

  const total = await Company.countDocuments()

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  }
}

const getEmployeesFromDB = async (
  filters: IEmployeeFilters,
  paginationOptions: IPaginationOptions,
): Promise<IGenericResponse<IEmployee[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions)

  const { searchTerm } = filters

  const result = await Employee.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },

    {
      $match: {
        ...(searchTerm && {
          $or: [
            { 'user.name': { $regex: searchTerm, $options: 'i' } },
            { 'user.email': { $regex: searchTerm, $options: 'i' } },
            { designation: { $regex: searchTerm, $options: 'i' } },
          ],
        }),
      },
    },
    {
      $project: {
        'user._id': 1,
        'user.name': 1,
        'user.email': 1,
        'user.profile': 1,
        'user.address': 1,
        designation: 1,
        budget: 1,
        duration: 1,
        budgetLeft: 1,
        budgetAssignedAt: 1,
        budgetExpiredAt: 1,
        'user.status': 1,
        _id: 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $sort: {
        [sortBy]: sortOrder === 'asc' ? 1 : -1,
      },
    },
  ])

  const total = await Employee.countDocuments()

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  }
}

const updateEmployee = async (id: Types.ObjectId, payload:Partial<IEmployee & IUser>) => {
const session = await mongoose.startSession();
session.startTransaction();

try {
  const {name, email, address, contact, profile, ...restData} = payload;

  const isUserExist = await Employee.findOne({user: id}).populate('user',{name: 1, email: 1, address: 1, contact: 1, status: 1, role: 1}).session(session);
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Requested user does not exist');
  }

  const updateFields: Partial<{ name: string; email: string; address: string; contact: string; profile: string }> = {};

  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (address) updateFields.address = address;
  if (contact) updateFields.contact = contact;
  if (profile) updateFields.profile = profile;
  
  if (Object.keys(updateFields).length > 0) {
    const updatedUser = await User.findByIdAndUpdate(id, { $set: updateFields }, { new: true, session });
  
    if (!updatedUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update user data');
    }
  }

  const {budget, duration} = restData;

  if ((budget !== isUserExist.budget && duration !== isUserExist.duration) && (budget !== undefined || duration !== undefined)) { 


    const company = await Company.findOne({user: id}).session(session);
    if (!company) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Requested company does not exist');
    }

    const totalBudget = company.totalBudget + (budget! + isUserExist.budget);
    company.totalBudget = totalBudget;


    const updatedCompany = await company.save({ session });

    if (!updatedCompany) {  
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update company data');
    }

    const startDate = new Date()
    
    const endDate = new Date(startDate)
    endDate.setMonth(startDate.getMonth() + duration!)
    
    const endDateISO = endDate.toISOString()
    
    restData.budgetAssignedAt = startDate;
    restData.budgetExpiredAt = endDateISO as unknown as Date
    restData.budget= budget! + isUserExist.budget || 0;
    restData.budgetLeft = budget! + isUserExist.budgetLeft || 0;
    restData.duration = duration!;


  }

  const updatedEmployee = await Employee.findOneAndUpdate({ user: id }, { $set: restData }, {
    new: true,
    session
  });

  if (!updatedEmployee) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update employee data');  
  }

  await session.commitTransaction();
  return updatedEmployee;
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}

};


const updateCompany = async (id: Types.ObjectId, payload:Partial<ICompany & IUser>) => {
  const isCompanyExist = await Company.findById(id);
  if (!isCompanyExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Requested company does not exist');
  }

  const updatedCompany = await Company.findByIdAndUpdate(id, { $set: payload }, { new: true });
  if (!updatedCompany) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update company data');
  }
  return updatedCompany;
};


export const AdminServices = {
  getCompaniesFromDB,
  getCompanyProfileInformation,
  getEmployeesFromDB,
  updateEmployee,
  updateCompany 
}
