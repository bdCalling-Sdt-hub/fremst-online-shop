import { z } from 'zod';
import { PRODUCT_SIZE } from './product.interface';

const createProductZodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be positive'),
  description: z.string().min(1, 'Description is required'),
  additionalInfo: z.string().optional(),
  sizes: z.array(z.string()).min(1, 'At least one size is required'),
  colors: z.array(z.string()).min(1, 'At least one color is required'),
  salePrice: z.number().positive('Sale price must be positive'),
  category: z.string().min(1, 'Category is required'),
  // subcategory: z.string().min(1, 'Subcategory is required'),
  quantity: z.number().int().nonnegative('Quantity must be a non-negative integer'),
  brands: z.array(z.string()).min(1, 'At least one brand is required'),
  tags: z.array(z.string()),
  availability: z.boolean(),
});






const updateProductZodSchema = z.object({
  name: z.string().optional(),
  price: z.number().positive('Price must be positive').optional(),
  description: z.string().optional(),
  additionalInfo: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  salePrice: z.number().positive('Sale price must be positive').optional(),
  category: z.string().optional(),
  // subcategory: z.string().optional(),
  quantity: z.number().int().nonnegative('Quantity must be a non-negative integer').optional(),
  brands: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  availability: z.boolean().optional(),
  existingFeaturedImages: z.array(z.string()).optional(),
});

export const ProductValidations = {
  createProductZodSchema,
  updateProductZodSchema
};


