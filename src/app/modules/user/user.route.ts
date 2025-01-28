import express, { NextFunction, Request, Response } from 'express'
import { UserController } from './user.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import fileUploadHandler from '../../middleware/fileUploadHandler'

import { UserValidations } from './user.validation'

const router = express.Router()

router.post(
  '/create-account',
  auth(USER_ROLES.ADMIN, USER_ROLES.COMPANY, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body.data)
    console.log(req.files)
    if (req.body.data) {
      req.body = UserValidations.createUserZodSchema.parse(
        JSON.parse(req.body.data),
      )
    }
    return UserController.createUser(req, res, next)
  },
)

router.patch(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.COMPANY, USER_ROLES.SUPER_ADMIN,USER_ROLES.EMPLOYEE),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    if (req.body.data) {
      req.body = UserValidations.updateUserZodSchema.parse(
        JSON.parse(req.body.data),
      )
    }
    return UserController.updateUser(req, res, next)
  },
)

router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.COMPANY, USER_ROLES.SUPER_ADMIN,USER_ROLES.EMPLOYEE),
  UserController.getUserProfile
)

export const UserRoutes = router
