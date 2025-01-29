import { z } from 'zod';

const createOrderZodSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        product: z.string({
          required_error: 'Product id is required',
        }),
        quantity: z.number({
          required_error: 'Quantity is required',
        }).min(1, 'Quantity must be at least 1'),
        size: z.string().optional(),
        color: z.string().optional(),
      })
    ).min(1, 'At least one product is required'),
    address: z.string().optional(),
    additionalInfo: z.string().optional(),
  }),
});

const updateOrderZodSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'shipped', 'delivered', 'cancelled']).optional(),
  }), 
});

export const OrderValidation = {
  createOrderZodSchema,
  updateOrderZodSchema,
};
