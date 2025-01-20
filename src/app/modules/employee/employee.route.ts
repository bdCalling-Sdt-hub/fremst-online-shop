import express, { NextFunction, Request, Response } from 'express'
import { EmployeeController } from './employee.controller'
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';


const router = express.Router()

router.get('/', auth(USER_ROLES.EMPLOYEE), EmployeeController.getEmployeeProfile);


export const EmployeeRoutes = router
