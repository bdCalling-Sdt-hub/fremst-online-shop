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
): Promise<IUser | IEmployee | ICompany> => {
  const session = await mongoose.startSession()
  let createdUser: IUser | IEmployee | ICompany | null = null

  try {
    session.startTransaction()

    if (
      payload.role === USER_ROLES.ADMIN &&
      user.role === USER_ROLES.SUPER_ADMIN
    ) {
      const userDocs = await User.create([payload], { session })
      createdUser = userDocs[0]
      if (!createdUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin.')
      }

      await session.commitTransaction()
      return createdUser
    }

    if (
      payload.role === USER_ROLES.EMPLOYEE &&
      (user.role === USER_ROLES.COMPANY || user.role === USER_ROLES.SUPER_ADMIN)
    ) {
      const { designation, budget, duration, ...userData } = payload
      const userDoc = await User.create([userData], { session })
      if (!userDoc || userDoc.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user.')
      }

      const startDate = new Date()

      const endDate = new Date(startDate)
      endDate.setMonth(startDate.getMonth() + duration)

      const endDateISO = endDate.toISOString()

      const employeeDocs = await Employee.create(
        [
          {
            designation: designation,
            user: userDoc[0]._id,
            budget: budget,
            duration: duration,
            budgetExpiredAt: endDateISO,
            role: USER_ROLES.EMPLOYEE,
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
    } else {
      const userDoc = await User.create([payload], { session })
      if (!userDoc || userDoc.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user.')
      }

      const companyDocs = await Company.create(
        {
          user: userDoc[0]._id,
        },
        { session },
      )
      createdUser = companyDocs[0]

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

export const UserServices = {
  createUserToDB,
}
