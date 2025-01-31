import { z } from 'zod';

const createOrUpdateCartZodSchema = z.object({
    body: z.object({
       product: z.string({
        required_error: 'Product id is required',
       }),
       quantity: z.number({
        required_error: 'Quantity is required',
       }).min(1, 'Quantity must be at least 1'),
       size: z.string().optional(),
       color: z.string().optional(),
    }),
});

const removeProductFromCartZodSchema = z.object({
    body: z.object({
       product: z.string({
        required_error: 'Product id is required',
       }),
    }),
});

export const CartValidations = {  createOrUpdateCartZodSchema, removeProductFromCartZodSchema };
