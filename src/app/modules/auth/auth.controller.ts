import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { UserServices } from '../user/user.service'
import { ILoginResponse } from './auth.interface'
import { AuthServices } from './auth.service'

const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body
  const user = await AuthServices.loginUser(email, password)
  sendResponse<ILoginResponse>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User logged in successfully!',
    data: user,
  })
})


const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body
  const user = req.user
  await AuthServices.changePassword({ oldPassword, newPassword, confirmPassword }, user)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully!',
  })
})

export const AuthController = {
  loginUser,
  changePassword,
}
