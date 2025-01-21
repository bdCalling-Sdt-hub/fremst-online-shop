import express, { NextFunction, Request, Response } from 'express'
import { AdminController } from './admin.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import validateRequest from '../../middleware/validateRequest'
import { AdminValidations } from './admin.validation'
import fileUploadHandler from '../../middleware/fileUploadHandler'

const router = express.Router()

router.get(
  '/companies',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.getCompanies,
)

router.get(
  '/employees',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.getEmployees,
)

router.get(
  '/companies/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.getCompanyProfileInformation,
)


router.patch(
  '/employee/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY),
  fileUploadHandler (),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
        req.body = AdminValidations.updateEmployeeZodSchema.parse(
            JSON.parse(req.body.data),
        )
       
    }
    AdminController.updateEmployeeProfile(req, res, next)
  }
)

router.patch(
  '/company/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY),
  fileUploadHandler (),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
        req.body = AdminValidations.updateCompanyZodSchema.parse(
            JSON.parse(req.body.data),
        )
       
    }
    AdminController.updateCompanyProfile(req, res, next)
  }
)

export const AdminRoutes = router
