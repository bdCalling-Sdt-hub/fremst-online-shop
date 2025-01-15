import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { USER_STATUS } from '../user/user.constants'
import { User } from '../user/user.model'
import { jwtHelper } from '../../../helpers/jwtHelper'
import { USER_ROLES } from '../../../enum/user'
import { Company } from '../company/company.model'
import { Employee } from '../employee/employee.model'
import config from '../../../config'
import { Secret } from 'jsonwebtoken'
import { ILoginResponse } from './auth.interface'

const loginUser = async (
  email: string,
  password: string,
): Promise<ILoginResponse> => {
  const isUserExist = await User.findOne(
    {
      email,
    },
    { role: 1, status: 1 },
  ).select('+password')
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No user found with this email.')
  }

  if (isUserExist.status === USER_STATUS.RESTRICTED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your account has been restricted please contact admin',
    )
  }

  const isPasswordMatched = await User.isPasswordMatched(
    password,
    isUserExist.password,
  )
  if (!isPasswordMatched) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect')
  }

  let roleBasedUser
  if (
    isUserExist.role === USER_ROLES.ADMIN ||
    isUserExist.role === USER_ROLES.SUPER_ADMIN
  ) {
    roleBasedUser = isUserExist
  } else if (isUserExist.role === USER_ROLES.COMPANY) {
    roleBasedUser = await Company.findOne({ user: isUserExist._id })
  } else if (isUserExist.role === USER_ROLES.EMPLOYEE) {
    roleBasedUser = await Employee.findOne({ user: isUserExist._id })
  }

  if (!roleBasedUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to find user based on role',
    )
  }
  //create access and refresh token
  const accessToken = jwtHelper.createToken(
    {
      authId: isUserExist._id,
      email: isUserExist.email,
      role: isUserExist.role,
      ...(isUserExist.role !== USER_ROLES.ADMIN &&
        isUserExist.role !== USER_ROLES.SUPER_ADMIN && {
          userId: roleBasedUser._id,
        }),
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  )

  const refreshToken = jwtHelper.createToken(
    {
      authId: isUserExist._id,
      ...(isUserExist.role !== USER_ROLES.ADMIN &&
        isUserExist.role !== USER_ROLES.SUPER_ADMIN && {
          userId: roleBasedUser._id,
        }),
      email: isUserExist.email,
      role: isUserExist.role,
    },
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as string,
  )

  return {
    accessToken,
    refreshToken,
  }
}

export const AuthServices = {
  loginUser,
}
