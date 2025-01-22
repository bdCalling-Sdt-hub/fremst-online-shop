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
    contact: z.string({
      required_error: 'Contact is required' }),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, 'Password must be more than 8 characters'),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.COMPANY, USER_ROLES.EMPLOYEE], {
    required_error: 'Role is required',
  }),
  company: z.string().optional(),
  budget: z.number().optional(),
  designation: z.string().optional(),
  duration: z.number().optional(),
  address: z.string().optional(),
})


const updateUserZodSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
  designation: z.string().optional(),
  duration: z.number().optional(),
})

export const UserValidations = {
  createUserZodSchema,
  updateUserZodSchema
}
