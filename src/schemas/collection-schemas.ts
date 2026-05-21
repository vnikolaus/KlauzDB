import z from 'zod'
import { KlauzValidationError } from '../errors/klauz-error'

const collectionNamePattern = /^[a-zA-Z0-9_-]+$/

export function parseSchema<TSchema extends z.ZodTypeAny>(schema: TSchema, data: unknown): z.infer<TSchema> {
    const result = schema.safeParse(data)

    if (!result.success) {
        const error = result.error.errors.at(-1)
        throw new KlauzValidationError(error?.message ?? 'Invalid params', {
            cause: result.error
        })
    }

    return result.data
}

export const klauzPropsSchema = z.object({
    path: z.string().trim().min(1)
}).strict()

export const collectionNameSchema = z
    .string()
    .trim()
    .min(1)
    .regex(collectionNamePattern, 'Collection name must contain only letters, numbers, hyphens and underscores')

export const collectionDataSchema = z.record(
    z.string(),
    z.unknown(),
    { message: `Content must be a object. Use 'addMany' method, to insert a new array` }
)

export const collectionDataArraySchema = z.array(collectionDataSchema)

export const findAllOptionsSchema = z.object({
    hideInfo: z.array(z.string().min(1)).optional()
}).strict().optional()

export const findOptionsSchema = z.object({
    where: z.function(),
    hideInfo: z.array(z.string().min(1)).optional()
}).strict()

export const updateOptionsSchema = z.object({
    where: z.function(),
    values: collectionDataSchema
}).strict()

export const deleteOptionsSchema = z.object({
    where: z.function()
}).strict()
