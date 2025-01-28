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
import { employeeFilterableFields } from '../employee/employee.constants'
import { IEmployee } from '../employee/employee.interface'
import { Types } from 'mongoose'

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

const getCompanyProfileInformation = catchAsync(async (req: Request, res: Response) => {

  const company_id = req.params.id
  const company = await AdminServices.getCompanyProfileInformation(company_id)
  sendResponse<ICompany>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Company retrieved successfully',
    data: company,
  })
})  


const getEmployees = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, employeeFilterableFields)
  const paginationOptions = pick(req.query, paginationFields)

  filters.companyId = filters.companyId ? filters.companyId : req.user.userId

  const employees = await AdminServices.getEmployeesFromDB(
    filters,
    paginationOptions,
  )
  sendResponse<IGenericResponse<IEmployee[]>>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Employees retrieved successfully',
    data: employees,
  })
})


const updateEmployeeProfile = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const employee = await AdminServices.updateEmployee(
    new Types.ObjectId(req.params.id),
    payload,
  )
  sendResponse<IEmployee>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Employee updated successfully',
    data: employee,
  })
})

  const updateCompanyProfile = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body
    const company = await AdminServices.updateCompany(
      new Types.ObjectId(req.params.id),
      payload,
    )
    sendResponse<ICompany>(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Company updated successfully',
      data: company,
    })
  })

  const getEmployeeProfileInformation = catchAsync(async (req: Request, res: Response) => {
    const employee_id = req.params.id
    const employee = await AdminServices.getEmployeeProfileInformationFromDB(employee_id)
    sendResponse<IEmployee>(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Employee retrieved successfully',
      data: employee,
    })
  })

export const AdminController = {
  getCompanies,
  getCompanyProfileInformation,
  getEmployees,
  updateEmployeeProfile,
  updateCompanyProfile,
  getEmployeeProfileInformation,
}
