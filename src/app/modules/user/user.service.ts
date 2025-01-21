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
  payload: IUser & IEmployee & ICompany ,
): Promise<IUser | IEmployee | ICompany | null> => {
  const session = await mongoose.startSession()
  let createdUser: IUser | IEmployee | ICompany | null = null

  try {
    session.startTransaction()

    if (
      (payload.role === USER_ROLES.ADMIN || payload.role === USER_ROLES.SUPER_ADMIN) 
    ) {

      if((payload.role === USER_ROLES.SUPER_ADMIN && user.role !== USER_ROLES.SUPER_ADMIN) ||( payload.role === USER_ROLES.ADMIN && user.role !== USER_ROLES.SUPER_ADMIN)){
       throw new ApiError(StatusCodes.BAD_REQUEST, 'Only Super Admin can create Super Admin or Admin')
      }

      const userDocs = await User.create([payload], { session })
      createdUser = userDocs[0]
      if (!createdUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Failed to create ${payload.role}`)
      }

      await session.commitTransaction()
      return createdUser
    }

    if (
      payload.role === USER_ROLES.EMPLOYEE &&
      (user.role === USER_ROLES.COMPANY || user.role === USER_ROLES.SUPER_ADMIN)
    ) {
      const { designation, budget, duration, company, ...userData } = payload
      const userDoc = await User.create([userData], { session })
      if (!userDoc || userDoc.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user.')
      }

      const startDate = new Date()

      const endDate = new Date(startDate)
      endDate.setMonth(startDate.getMonth() + duration)

      const endDateISO = endDate.toISOString()

      const companyId = user.role === USER_ROLES.COMPANY ? user.authId : company

      const employeeDocs = await Employee.create(
        [
          {
            company: companyId,
            designation: designation,
            user: userDoc[0]._id,
            budget: budget,
            totalBudget: budget,
            budgetLeft: budget,
            duration: duration,
            budgetExpiredAt: endDateISO,
            createdBy: user.authId,
          },
        ],
        { session },
      )
      createdUser = employeeDocs[0]

      if (!createdUser) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Failed to create employee.',
        )
      }
      //make sure that the company total budget of the company is updated
      await Company.updateOne(
        { _id: companyId },
        {
          $inc: { 
            totalEmployees: 1,
            totalBudget: budget 
          }
        },
        { session },
      )


    } 
    
    if (payload.role === USER_ROLES.COMPANY && (user.role === USER_ROLES.SUPER_ADMIN || user.role === USER_ROLES.ADMIN)) {
      console.log(payload,"INN")
      const userDoc = await User.create([payload], { session })
      if (!userDoc || userDoc.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user.')
      }

      const companyDocs = await Company.create(
        [
          {
            user: userDoc[0]._id,
            createdBy: user.authId,
          },
        ],
        { session },
      )
      if (!companyDocs || companyDocs.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create company.')
      }
      createdUser = companyDocs[0]
      console.log(createdUser)
      if (!createdUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create company.')
      }
    }

    await session.commitTransaction()
    return createdUser
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}


const updateUserToDB = async (user: JwtPayload, payload: Partial<IUser>) => {
  const updatedUser = await User.findOneAndUpdate(user.authId, {$set: payload}, {
    new: true,
  }).populate({
    path: 'company',
    select: {
      name: 1,
      address: 1,
      phone: 1,
      email: 1,
    },
  }).populate({
    path: 'user', 
    select: {
      name: 1,
      email: 1,
      address: 1,
      contact: 1,
      status: 1,
      role: 1,
    },
  }).lean()
  return updatedUser
}

export const UserServices = {
  createUserToDB,
  updateUserToDB,
}
