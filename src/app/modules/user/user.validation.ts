import { z } from 'zod'
import { USER_ROLES } from '../../../enum/user'

const createUserZodSchema = z
  .object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .min(1, 'Name is required'),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, 'Password must be more than 8 characters'),
    role: z.enum([USER_ROLES.ADMIN, USER_ROLES.COMPANY, USER_ROLES.EMPLOYEE, USER_ROLES.SUPER_ADMIN], {
      required_error: 'Role is required',
    }),
    company: z.string().optional(),
    budget: z.number().optional(),
    designation: z.string().optional(),
    duration: z.number().optional(),
    contact: z.string().optional(),
    address: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === USER_ROLES.EMPLOYEE) {
        return (
          data.company &&
          data.budget &&
          data.designation &&
          data.duration &&
          data.contact &&
          data.address
        )
      }
      return true
    },
    {
      message:
        'Company, budget, designation, duration, contact and address are required for employees',
      path: ['company', 'budget', 'designation', 'duration', 'contact', 'address'],
    }
  )

const updateUserZodSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    contact: z.string().optional(),
    designation: z.string().optional(),

})

export const UserValidations = {
  createUserZodSchema,
  updateUserZodSchema
}
