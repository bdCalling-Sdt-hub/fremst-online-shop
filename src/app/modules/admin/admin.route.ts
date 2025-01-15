import express from 'express'
import { AdminController } from './admin.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.get(
  '/companies',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.getCompanies,
)

export const AdminRoutes = router
