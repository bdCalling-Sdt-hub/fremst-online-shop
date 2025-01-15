import { paginationHelper } from '../../../helpers/paginationHelper'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { IGenericResponse } from '../../../interfaces/response'
import { ICompany, ICompanyFilters } from '../company/company.interface'
import { Company } from '../company/company.model'
import { AdminModel } from './admin.interface'

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
        as: 'userData',
      },
    },
    {
      $unwind: '$userData',
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
            { 'userData.name': { $regex: searchTerm, $options: 'i' } },
            { 'userData.address': { $regex: searchTerm, $options: 'i' } },
            { 'userData.phone': { $regex: searchTerm, $options: 'i' } },
            { 'userData.email': { $regex: searchTerm, $options: 'i' } },
          ],
        }),
      },
    },
    {
      $project: {
        'userData._id': 1,
        'userData.name': 1,
        'userData.email': 1,
        'userData.address': 1,
        'userData.phone': 1,
        'userData.status': 1,
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

export const AdminServices = {
  getCompaniesFromDB,
}
