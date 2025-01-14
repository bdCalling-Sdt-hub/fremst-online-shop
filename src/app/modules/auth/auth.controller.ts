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

export const AuthController = {
  loginUser,
}
