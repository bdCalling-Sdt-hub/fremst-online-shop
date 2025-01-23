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
  const token = req.headers.authorization || ''
  const payload = {
    token,
    ...req.body
  }
  await AuthServices.resetPassword(payload);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successful',
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

export const AuthController = {
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  contactUs,
}
