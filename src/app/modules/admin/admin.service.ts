import { paginationHelper } from '../../../helpers/paginationHelper'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { IGenericResponse } from '../../../interfaces/response'
import { ICompany, ICompanyFilters } from '../company/company.interface'
import { Company } from '../company/company.model'
import { IEmployee, IEmployeeFilters } from '../employee/employee.interface'
import { Employee } from '../employee/employee.model'
import { AdminModel } from './admin.interface'




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


export const AdminServices = {
  getCompaniesFromDB,
  getCompanyProfileInformation,
  getEmployeesFromDB
}
