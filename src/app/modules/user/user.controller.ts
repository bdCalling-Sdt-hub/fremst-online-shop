import { Request, Response, NextFunction } from 'express'
import { UserServices } from './user.service'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { StatusCodes } from 'http-status-codes'
import { Types } from 'mongoose'

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

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  if (req.files && 'image' in req.files && req.files.image.length > 0) {
    payload.profile = `/images/${req.files.image[0].filename}`
  }
  const user = await UserServices.updateUserToDB(req.user, payload)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User updated successfully!',
    data: user,
  })
})

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.getUserProfileFromDB(req.user)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successfully!',
    data: user,
  })
})

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const admin = await UserServices.deleteAdmin(req.user, new Types.ObjectId(id))
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin deleted successfully!',
    data: admin,
  })
})

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await UserServices.deleteUser(req.user, new Types.ObjectId(id))
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User deleted successfully!',
    data: "User deleted successfully",
  })
})

export const UserController = {
  createUser,
  updateUser,
  getUserProfile,
  deleteAdmin,
  deleteUser
}
