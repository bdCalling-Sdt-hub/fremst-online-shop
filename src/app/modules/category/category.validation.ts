import { z } from 'zod';
const createCategoryZodSchema = z.object({

        title: z
            .string({
                required_error: 'Name is required',
            })
            .min(1, 'Name is required'),

})

const updateCategoryZodSchema = z.object({

        title: z
            .string({
                required_error: 'Name is required',
            })
            .optional(),

})
export const CategoryValidations = {    
    createCategoryZodSchema,
    updateCategoryZodSchema
 };
