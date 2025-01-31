import express from 'express'
import validateRequest from '../../middleware/validateRequest'
import { AuthValidations } from './auth.validation'
import { AuthController } from './auth.controller'
import auth from '../../middleware/auth'
import { USER_ROLES } from '../../../enum/user'

const router = express.Router()

router.post(
  '/login',
  validateRequest(AuthValidations.loginUserZodSchema),
  AuthController.loginUser,
)

router.post(
  '/verify-email',
  validateRequest(AuthValidations.verifyEmailZodSchema),
  AuthController.verifyEmail
);

router.post(
  '/change-password',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.COMPANY, USER_ROLES.EMPLOYEE),
  validateRequest(AuthValidations.changePasswordZodSchema),
  AuthController.changePassword,
)

router.post(
  '/forgot-password',
  validateRequest(AuthValidations.forgotPasswordZodSchema),
  AuthController.forgotPassword
)

router.post(
  '/reset-password',
  validateRequest(AuthValidations.resetPasswordZodSchema),
  AuthController.resetPassword
)

router.post(
  '/contact',
  validateRequest(AuthValidations.contactValidation),
  AuthController.contactUs
);

router.post(
  '/refresh-token',
  AuthController.refreshToken
)



export const AuthRoutes = router
