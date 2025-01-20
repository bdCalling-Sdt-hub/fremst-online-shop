import { z } from 'zod'

const loginUserZodSchema = z.object({
  body: z.object({
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
  }),
})

const changePasswordZodSchema = z.object({
  body: z.object({
    oldPassword: z
      .string({
        required_error: 'Old password is required',
      })
      .min(8, 'Old password must be more than 8 characters'),
    newPassword: z
      .string({
        required_error: 'New password is required',
      })
      .min(8, 'New password must be more than 8 characters'),
    confirmPassword: z
      .string({
        required_error: 'Confirm password is required',
      })
      .min(8, 'Confirm password must be more than 8 characters'),
  }),
})

export const AuthValidations = {
  loginUserZodSchema,
  changePasswordZodSchema
}
