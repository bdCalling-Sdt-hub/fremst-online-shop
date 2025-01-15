import { Request, Response, NextFunction } from 'express'
import { AdminServices } from './admin.service'
import catchAsync from '../../../shared/catchAsync'
import pick from '../../../shared/pick'
import { companyFilterableFields } from '../company/company.constants'
import { paginationFields } from '../../../interfaces/pagination'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'
import { IGenericResponse } from '../../../interfaces/response'
import { ICompany } from '../company/company.interface'

const getCompanies = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, companyFilterableFields)
  const paginationOptions = pick(req.query, paginationFields)
  const companies = await AdminServices.getCompaniesFromDB(
    filters,
    paginationOptions,
  )
  sendResponse<IGenericResponse<ICompany[]>>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Companies retrieved successfully',
    data: companies,
  })
})

export const AdminController = {
  getCompanies,
}
