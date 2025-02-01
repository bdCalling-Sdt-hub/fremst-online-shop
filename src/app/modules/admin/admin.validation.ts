import { z } from 'zod';
const updateEmployeeZodSchema = z.object({
    name: z.string().optional(),
    address: z.object({
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
    }).optional(),
    contact: z.string().optional(),
    designation: z.string().optional(),
    email: z.string().email().optional(),
    budget: z.number().optional(),
    duration: z.number().optional(),
    budgetUpdate: z.boolean().optional(),
})

const updateCompanyZodSchema = z.object({
    name: z.string().optional(),
    address: z.object({
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
    }).optional(),
    contact: z.string().optional(),
    email: z.string().email().optional(),
})

export const AdminValidations = { updateEmployeeZodSchema, updateCompanyZodSchema };
