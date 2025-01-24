import {  IForgotPasswordRequest, ILoginResponse, IResetPasswordRequest, IContactForm } from './auth.interface';
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
    role: isUserExist.role as string ,
  }
}

const changePassword = async (payload: {oldPassword: string, newPassword: string, confirmPassword: string}, user:JwtPayload) => {
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

const forgotPassword = async (payload: IForgotPasswordRequest): Promise<void> => {
  const isUserExist = await User.findOne({ email: payload.email })
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
  }

  //create a new access token and mail it to the user
  const passwordResetToken = jwtHelper.createToken(
    { email: payload.email },
    config.jwt.jwt_secret as Secret,
    '5m',
  )

  const resetLink = `${config.frontend_url}/auth/reset-password?token=${passwordResetToken}`
  const forgetPassword = emailTemplate.resetPassword({ email: payload.email, resetLink })
  emailHelper.sendEmail(forgetPassword)


};

const resetPassword = async (payload: IResetPasswordRequest): Promise<void> => {
  const { token, newPassword, confirmPassword } = payload;

  if (newPassword !== confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Passwords do not match');
  }

  //verify token

  const decodedToken = jwtHelper.verifyToken(
    token,
    config.jwt.jwt_secret as Secret,
  )

  if (!decodedToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to verify token');
  }

const isUserExist = await User.findOne({email: decodedToken.email}).select('+password')
  if (!isUserExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Account not found');
  }


  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );


  await User.findByIdAndUpdate(isUserExist._id, {
    $set: {
      password: hashedPassword,
    },
  });
};

const sendContactEmail = async (payload: IContactForm): Promise<void> => {

  const contactEmail = emailTemplate.contactForm(payload)

  emailHelper.sendEmail(contactEmail);

  const replyEmail = emailTemplate.replyContactForm(payload)

  emailHelper.sendEmail(replyEmail);
};

export const AuthServices = {
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  sendContactEmail,
}
