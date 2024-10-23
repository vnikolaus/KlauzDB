import { ZodError } from "zod"

export function errorMessage(err: any) {
    if (err instanceof ZodError) {
        const error = err.errors.at(-1)
        return {
            error: error?.message
        }
    } else {
        return {
            error: err.message
        }
    }
}