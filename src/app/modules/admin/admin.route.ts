import express from 'express'
import { AdminController } from './admin.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'
import validateRequest from '../../middleware/validateRequest'
import { AdminValidations } from './admin.validation'

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
  validateRequest(AdminValidations.updateEmployeeZodSchema),
  AdminController.updateEmployeeProfile,
)

router.patch(
  '/company/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY),
  validateRequest(AdminValidations.updateCompanyZodSchema),
  AdminController.updateCompanyProfile,
)

export const AdminRoutes = router
