import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { ILoginResponse, IContactForm } from './auth.interface'

import { Request, Response } from 'express'
import { AuthServices } from './auth.service'

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body
  const user = await AuthServices.loginUser(email, password)
  sendResponse<ILoginResponse>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User logged in successfully!',
    data: user,
  })
})

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { oldPassword, newPassword, confirmPassword } = req.body
  const user = req.user
  await AuthServices.changePassword({ oldPassword, newPassword, confirmPassword }, user)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully!',
  })
})

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset instructions sent to your email',
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { ...resetData } = req.body;
  const result = await AuthServices.resetPassword(token!, resetData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Password reset successfully',
    data: result,
  });
});

const contactUs = catchAsync(async (req: Request, res: Response) => {
  const { ...contactData } = req.body;
  await AuthServices.sendContactEmail(contactData as IContactForm);
  
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Contact form submitted successfully'
  });
});


const verifyEmail = catchAsync(async (req: Request, res: Response) => {

  const {oneTimeCode, email} = req.body
  const result = await AuthServices.verifyEmail(email, oneTimeCode)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Email verified successfully',
    data: result
  });
})


const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const {refreshToken} = req.body
  console.log(refreshToken)
  const result = await AuthServices.refreshToken(refreshToken)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Refresh token retrieved successfully',
    data: result
  });
})

export const AuthController = {
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  contactUs,
  verifyEmail,
  refreshToken
}
