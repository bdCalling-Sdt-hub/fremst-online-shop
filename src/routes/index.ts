import { AdminRoutes } from '../app/modules/admin/admin.route'
import { EmployeeRoutes } from '../app/modules/employee/employee.route'
import { CompanyRoutes } from '../app/modules/company/company.route'
import { UserRoutes } from '../app/modules/user/user.route'
import express from 'express'
import { AuthRoutes } from '../app/modules/auth/auth.route'

const router = express.Router()

export const apiRoutes: { path: string; route: any }[] = [
  { path: '/auth', route: AuthRoutes },
  { path: '/user', route: UserRoutes },
  { path: '/company', route: CompanyRoutes },
  { path: '/employee', route: EmployeeRoutes },
  { path: '/admin', route: AdminRoutes },
]

apiRoutes.forEach(route => router.use(route.path, route.route))

export default router
