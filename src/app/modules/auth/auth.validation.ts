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

export const AuthValidations = {
  loginUserZodSchema,
}
