import { z } from 'zod';

const updateEmployeeZodSchema = z.object({
    name: z.string().optional(),
    address: z.object({
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
    }).optional(),
    designation: z.string().optional(),
    contact: z.string().optional(),
});

export const EmployeeValidations = { 
    updateEmployeeZodSchema
 };
