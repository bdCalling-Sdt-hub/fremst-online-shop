import z from 'zod';

const createOrUpdateOthersZodSchema = z.object({
    body: z.object({
        type: z.enum(["privacy-policy", "terms-and-conditions", "faq"], {
            required_error: 'Type is required',
        }),
        content: z.string({
            required_error: 'Content is required',
        }),
    })
})

const createFaqZodSchema = z.object({
    body: z.object({
        question: z.string({
            required_error: 'Question is required',
        }),
        answer: z.string({
            required_error: 'Answer is required',
        }),
    })
})
const updateFaqZodSchema = z.object({
    body: z.object({
        question: z.string().optional(),
        answer: z.string().optional(),
    })
})

export const OtherValidations = {
    createOrUpdateOthersZodSchema,
    createFaqZodSchema,
    updateFaqZodSchema,
}