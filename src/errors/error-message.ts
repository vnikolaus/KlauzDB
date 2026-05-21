import { ZodError } from "zod"
import { KlauzError, KlauzValidationError } from "./klauz-error"

export function errorMessage(err: unknown) {
    if (err instanceof ZodError) {
        const error = err.errors.at(-1)
        return {
            error: error?.message ?? 'Invalid params',
            code: 'KLAUZ_VALIDATION_ERROR'
        }
    }

    if (err instanceof KlauzError || err instanceof KlauzValidationError) {
        return {
            error: err.message,
            code: err.code
        }
    }

    if (err instanceof Error) {
        return {
            error: err.message,
            code: 'KLAUZ_ERROR'
        }
    }

    return {
        error: 'Unknown error',
        code: 'KLAUZ_ERROR'
    }
}
