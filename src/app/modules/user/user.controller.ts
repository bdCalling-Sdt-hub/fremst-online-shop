import { Request, Response, NextFunction } from 'express'
import { UserServices } from './user.service'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'

const createUser = catchAsync(async (req: Request, res: Response) => {
  if (req.files && 'image' in req.files && req.files.image.length > 0) {
    req.body.profile = `/images/${req.files.image[0].filename}`
  }
  const user = await UserServices.createUserToDB(req.user, req.body)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User created successfully!',
    data: user,
  })
})

export const UserController = {
  createUser,
}
