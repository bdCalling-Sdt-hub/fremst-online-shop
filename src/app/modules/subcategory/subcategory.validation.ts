import { z } from 'zod';

const createSubcategoryZodSchema = z.object({

    title: z
        .string({
        required_error: 'Name is required',
        })
        .min(1, 'Name is required'),
    categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
})

const updateSubcategoryZodSchema = z.object({

    title: z
        .string().optional(),
    categoryIds: z.array(z.string()).optional(),
})


export const SubcategoryValidations = { createSubcategoryZodSchema, updateSubcategoryZodSchema };
