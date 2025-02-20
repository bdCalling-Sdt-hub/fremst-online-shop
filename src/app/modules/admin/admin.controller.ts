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
import { IUser } from '../user/user.interface'

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
    req.user
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
  

  if(req.files && 'image' in req.files &&  req.files.image[0]){
    payload.profile = `/images/${req.files.image[0].filename}`
  }

  const employee = await AdminServices.updateEmployee(
    new Types.ObjectId(req.params.id),
    payload,
  )

  
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Employee updated successfully',
    data: "Employee budget updated successfully",
  })
})

  const updateCompanyProfile = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body
    const company = await AdminServices.updateCompany(
      new Types.ObjectId(req.params.id),
      payload,
    )
    sendResponse<ICompany | IUser>(res, {
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


  const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
    const admin = await AdminServices.getAllAdmin()
    sendResponse<IUser[]>(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Admin retrieved successfully',
      data: admin,
    })
  })


const manageProductAvailability = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const product = await AdminServices.manageProductAvailability(
    new Types.ObjectId(req.params.id),
    payload.products,
  )
  sendResponse<ICompany | IUser>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product availability updated successfully',
    data: product,
  })
})

const createOrUpdateCompanyBasedProductPrice = catchAsync(async  (req: Request, res: Response)=>{
  const company = req.params.id;
  const payload = req.body;
  const result = await AdminServices.createOrUpdateCompanyBasedProductPrice(new Types.ObjectId(company), payload.products);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product price updated successfully for the company.',
    data: result,
  })
})

export const AdminController = {
  getCompanies,
  getCompanyProfileInformation,
  getEmployees,
  updateEmployeeProfile,
  updateCompanyProfile,
  getEmployeeProfileInformation,
  getAllAdmin,
  manageProductAvailability,
  createOrUpdateCompanyBasedProductPrice
}
