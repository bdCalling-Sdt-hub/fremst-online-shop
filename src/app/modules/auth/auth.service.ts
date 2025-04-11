import {
  IForgotPasswordRequest,
  ILoginResponse,
  IResetPasswordRequest,
  IContactForm,
  IRefreshTokenResponse,
} from './auth.interface'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { USER_STATUS } from '../user/user.constants'
import { User } from '../user/user.model'
import { jwtHelper } from '../../../helpers/jwtHelper'
import { USER_ROLES } from '../../../enum/user'
import { Company } from '../company/company.model'
import { Employee } from '../employee/employee.model'
import config from '../../../config'
import { JwtPayload, Secret } from 'jsonwebtoken'

import bcrypt from 'bcrypt'
import { emailHelper } from '../../../helpers/emailHelper'
import { emailTemplate } from '../../../shared/emailTemplate'
import { ResetToken } from '../resetToken/resetToken.model'
import cryptoToken from '../../../helpers/cryptoToken'

const loginUser = async (
  email: string,
  password: string,
): Promise<ILoginResponse> => {
  const isUserExist = await User.findOne(
    {
      email,
      status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED] },
    },
    { role: 1, status: 1, email: 1 },
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

  if (isUserExist.status === USER_STATUS.DELETED) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No user found with this email.')
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
    role: isUserExist.role as string,
  }
}

const changePassword = async (
  payload: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  },
  user: JwtPayload,
) => {
  if (payload.newPassword !== payload.confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password does not match')
  }
  const isUserExist = await User.findById(user.authId).select('+password')
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  const isPasswordMatched = await User.isPasswordMatched(
    payload.oldPassword,
    isUserExist.password,
  )
  if (!isPasswordMatched) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Old password is incorrect')
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  )

  await User.findByIdAndUpdate(
    user.authId,
    { password: hashedPassword },
    { new: true },
  )
}

const forgotPassword = async (
  payload: IForgotPasswordRequest,
): Promise<void> => {
  const isUserExist = await User.findOne({
    email: payload.email.trim().toLowerCase(),
  }).select('+authentication')
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 5 * 60000),
  }
  // Store OTP in user document with 5 minutes expiry
  await User.findOneAndUpdate(
    { email: payload.email },
    {
      $set: {
        authentication: authentication,
      },
    },
  )

  // Send OTP via email
  const forgetPassword = emailTemplate.resetPasswordOTP({
    email: payload.email,
    otp: otp,
  })
  await emailHelper.sendEmail(forgetPassword)
}

const verifyEmail = async (email: string, oneTimeCode: string) => {
  const isExistUser = await User.findOne({ email: email }).select(
    '+authentication',
  )
  if (!isExistUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  if (!Number(oneTimeCode)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code',
    )
  }

  if (isExistUser.authentication?.oneTimeCode !== Number(oneTimeCode)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp')
  }

  const date = new Date()
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again',
    )
  }

  await User.findOneAndUpdate(
    { _id: isExistUser._id },
    {
      authentication: {
        isResetPassword: true,
        oneTimeCode: null,
        expireAt: null,
      },
    },
  )

  let message
  let data

  //create token ;
  const createToken = cryptoToken()
  await ResetToken.create({
    user: isExistUser._id,
    token: createToken,
    expireAt: new Date(Date.now() + 5 * 60000),
  })
  message =
    'Verification Successful: Please securely store and utilize this code for reset password'
  data = createToken
  return { data, message }
}

const refreshToken = async (
  token: string,
): Promise<IRefreshTokenResponse | null> => {
  let verifiedToken = null

  try {
    // Verify the refresh token
    verifiedToken = jwtHelper.verifyToken(
      token,
      config.jwt.jwt_refresh_secret as Secret,
    )
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh Token has expired')
    }
    throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid Refresh Token')
  }

  const { role, userId, authId } = verifiedToken

  const newAccessToken = jwtHelper.createToken(
    {
      id: authId,
      userId: userId,
      email: verifiedToken.email,
      role: role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  )

  return {
    accessToken: newAccessToken,
  }
}

const resetPassword = async (
  token: string,
  payload: IResetPasswordRequest,
): Promise<void> => {
  const { newPassword, confirmPassword } = payload
  //isExist token
  const isExistToken = await ResetToken.isExistToken(token)
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized')
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication',
  )
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'",
    )
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token)
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password',
    )
  }

  //check password
  if (newPassword.trim() !== confirmPassword.trim()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!",
    )
  }

  const hashPassword = await bcrypt.hash(
    newPassword.trim(),
    Number(config.bcrypt_salt_rounds),
  )

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  }

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  })
}

const sendContactEmail = async (payload: IContactForm): Promise<void> => {
  const contactEmail = emailTemplate.contactForm(payload)

  emailHelper.sendEmail(contactEmail)

  const replyEmail = emailTemplate.replyContactForm(payload)

  emailHelper.sendEmail(replyEmail)
}

export const AuthServices = {
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  sendContactEmail,
  verifyEmail,
  refreshToken,
}
