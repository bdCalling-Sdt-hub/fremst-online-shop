import { z } from 'zod';

const updateEmployeeZodSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    designation: z.string().optional(),
    contact: z.string().optional(),
});

export const EmployeeValidations = { 
    updateEmployeeZodSchema
 };
