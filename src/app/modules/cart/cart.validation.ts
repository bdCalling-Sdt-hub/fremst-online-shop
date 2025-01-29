import { z } from 'zod';

const createOrUpdateCartZodSchema = z.object({
    body: z.object({
        products: z.array(
            z.object({
                product: z.string({
                    required_error: 'Product id is required',
                }).optional(),
                quantity: z.number({
                    required_error: 'Quantity is required',
                }).min(1, 'Quantity must be at least 1').optional(),
                size: z.string().optional(),
                color: z.string().optional(),
            })
        ).min(1, 'At least one product is required').optional(),

    }),
});

export const CartValidations = {  createOrUpdateCartZodSchema };
