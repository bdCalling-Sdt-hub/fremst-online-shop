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

const forgotPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
  }),
});

const resetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z
      .string({
        required_error: 'New password is required',
      })
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string({
        required_error: 'Confirm password is required',
      })
      .min(8, 'Password must be at least 8 characters'),
  }),
});

const contactValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required'
    }),
    email: z.string({
      required_error: 'Email is required'
    }).email('Invalid email format'),
    contact: z.string({
      required_error: 'Contact number is required'
    }),
    message: z.string({
      required_error: 'Message is required'
    })
  })
});

const verifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required'
    }).email('Invalid email format'),
    oneTimeCode: z.string({
      required_error: 'One time code is required'
    })
  })
});

export const AuthValidations = {
  loginUserZodSchema,
  changePasswordZodSchema,
  forgotPasswordZodSchema,
  resetPasswordZodSchema,
  contactValidation,
  verifyEmailZodSchema
}
