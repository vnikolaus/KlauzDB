export type KlauzErrorCode =
    | 'KLAUZ_ERROR'
    | 'KLAUZ_VALIDATION_ERROR'
    | 'KLAUZ_STORAGE_ERROR'
    | 'KLAUZ_NOT_FOUND'

export class KlauzError extends Error {
    constructor(
        message: string,
        public readonly code: KlauzErrorCode = 'KLAUZ_ERROR',
        options?: ErrorOptions
    ) {
        super(message, options)
        this.name = 'KlauzError'
    }
}

export class KlauzValidationError extends KlauzError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 'KLAUZ_VALIDATION_ERROR', options)
        this.name = 'KlauzValidationError'
    }
}

export class KlauzStorageError extends KlauzError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 'KLAUZ_STORAGE_ERROR', options)
        this.name = 'KlauzStorageError'
    }
}

export class KlauzNotFoundError extends KlauzError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 'KLAUZ_NOT_FOUND', options)
        this.name = 'KlauzNotFoundError'
    }
}
