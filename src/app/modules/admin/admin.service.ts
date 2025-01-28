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
import { IUser } from '../user/user.interface'
import mongoose, { Types, PipelineStage } from 'mongoose'
import { profile } from 'winston'




//company profile information 
const getCompanyProfileInformation = async (company_id: string) => {
  const company = await Company.findById(company_id,{user:1, totalEmployees:1, totalOrders:1, totalBudget:1, totalSpentBudget:1}).populate({
    path: 'user',
    select: {
      name: 1,
      email: 1,
      address: 1,
      profile: 1,
      contact: 1,
      status: 1,},
  })
  


  if (!company) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found')
  }

  return company
}


const getEmployeeProfileInformationFromDB = async (employee_id: string) => {
  const employee = await Employee.findById(employee_id,{user:1, company:1, designation:1, totalOrders:1, totalBudget:1, totalSpentBudget:1}).populate({
    path: 'user',
    select: {
      name: 1,
      email: 1,
      address: 1,
      contact: 1,
      profile:1,
      status: 1,
    },
  })

  if (!employee) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found')
  }
  
  return employee
}



const getCompaniesFromDB = async (
  filters: ICompanyFilters,
  paginationOptions: IPaginationOptions,

): Promise<IGenericResponse<ICompany[]>> => {
  
  
const { page, limit, skip, sortBy, sortOrder } =
  paginationHelper.calculatePagination(paginationOptions)

const { searchTerm,...filterData } = filters

const andConditions = []

if (searchTerm) {
  andConditions.push({
    $or: [
      { 'user.name': { $regex: searchTerm, $options: 'i' } },
      { 'user.email': { $regex: searchTerm, $options: 'i' } },
      { 'user.address': { $regex: searchTerm, $options: 'i' } },
    ],
  })
}

if (Object.keys(filterData).length) {
  andConditions.push({
    $and: Object.entries(filterData).map(([field, value]) => ({
      [field]: value,
    })),
  })
}



const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {}



const result = await Company.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
    },
  },
  { $unwind: '$user' },
  { $match: whereConditions },
  {
    $facet: {
      total: [{ $count: 'count' }],
      data: [
        {
          $project: {
            _id: 1,
            totalEmployees: 1,
            totalOrders: 1,
            totalBudget: 1,
            totalSpentBudget: 1,
            'user.name': 1,
            'user.email': 1,
            'user.address': 1,
            'user.contact': 1,
            'user.status': 1,
            'user.profile': 1,
          },
        },
        { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
        { $skip: skip },
        { $limit: limit },
      ],
    },
  },
])

const total = result[0].total[0]?.count || 0
const data = result[0].data

return {
  meta: {
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit),
  },
  data,
}


}

const getEmployeesFromDB = async (
  filters: IEmployeeFilters,
  paginationOptions: IPaginationOptions,
): Promise<IGenericResponse<IEmployee[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions)

  const { searchTerm, companyId } = filters

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
        ...(companyId && { company:companyId }),
      },
    },
    {
      $facet: {
        total: [{ $count: 'count' }],
        data: [
          {
            $project: {
              'user._id': 1,
              'user.name': 1,
              'user.email': 1,
              'user.profile': 1,
              'user.address': 1,
              'user.contact': 1,
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
            $sort: {
              [sortBy]: sortOrder === 'asc' ? 1 : -1,
            },
          },
          { $skip: skip },
          { $limit: limit },
        ],
      },
    },
  ])

  const total = result[0].total[0]?.count || 0
  const data = result[0].data

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  }
}

const updateEmployee = async (id: Types.ObjectId, payload:Partial<IEmployee & IUser & {budgetUpdate?:boolean}>) => {
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

  const {budget, duration, budgetUpdate} = restData;

  if (Boolean(budgetUpdate)) { 
    if(!budget || !duration){
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Budget and duration are required');
    }

    const company = await Company.findById(isUserExist.company).session(session);
    if (!company) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Requested company does not exist');
    }

    const totalBudget = company.totalBudget + budget!;
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
    restData.budget= budget;
    restData.totalBudget = budget! + isUserExist.budget || 0;
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
  console.log(isCompanyExist,"isCompanyExist")

  const updatedCompany = await User.findByIdAndUpdate(isCompanyExist.user, { $set: payload }, { new: true });
  if (!updatedCompany) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update company data');
  }
  console.log(updatedCompany,"updatedCompany")
  return updatedCompany;
};


export const AdminServices = {
  getCompaniesFromDB,
  getCompanyProfileInformation,
  getEmployeesFromDB,
  updateEmployee,
  updateCompany,
  getEmployeeProfileInformationFromDB,
}
