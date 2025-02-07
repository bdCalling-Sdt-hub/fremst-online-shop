import { z } from 'zod';
const createTagZodSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .min(1, 'Name is required'),
        rate: z
            .number({
                required_error: 'Rate is required',
            })
            .min(1, 'Rate is required'),
    }),

})

const updateTagZodSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Name is required',
            })
            .optional(),
        rate: z
            .number({
                required_error: 'Rate is required',
            })
            .optional(),
    }),
})

const addCustomerOrRemoveFromTagZodSchema = z.object({
    body: z.object({
        companies: z.array(z.string({required_error: 'Company is required'})),
    }),
});

const addOrRemoveProductFromTagZodSchema = z.object({
    body: z.object({
        products: z.array(z.string({required_error: 'Product is required'})),
    }),
})


export const TagsValidations = {  
        createTagZodSchema,
        updateTagZodSchema,
        addCustomerOrRemoveFromTagZodSchema,
        addOrRemoveProductFromTagZodSchema
};
