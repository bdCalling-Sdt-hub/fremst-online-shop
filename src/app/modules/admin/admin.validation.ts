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
    isBudgetUpdated: z.boolean().optional(),
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

const manageProductAvailabilityZodSchema = z.object({
    body:z.object({
        products: z.array(z.string(),{required_error: 'At least one product is required'}).min(1, 'At least one product is required' ),
    })
})


const manageCompanyBasedProductProduct = z.object({
    body:z.object({
        products:z.array(z.object({
            product:z.string({required_error:"product is required"}),
            price:z.number({required_error:"Product price is required."})
        }))
    })
})

export const AdminValidations = { updateEmployeeZodSchema, updateCompanyZodSchema, manageProductAvailabilityZodSchema,manageCompanyBasedProductProduct };
