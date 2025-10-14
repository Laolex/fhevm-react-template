export class FHEVMError extends Error {
    public readonly code: string;
    public readonly details?: any;

    constructor(message: string, code: string, details?: any) {
        super(message);
        this.name = 'FHEVMError';
        this.code = code;
        this.details = details;
    }
}

export const FHEVM_ERROR_CODES = {
    NOT_INITIALIZED: 'NOT_INITIALIZED',
    INVALID_CONFIG: 'INVALID_CONFIG',
    ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
    DECRYPTION_FAILED: 'DECRYPTION_FAILED',
    CONTRACT_CALL_FAILED: 'CONTRACT_CALL_FAILED',
    INVALID_PROVIDER: 'INVALID_PROVIDER',
    NETWORK_ERROR: 'NETWORK_ERROR',
    SIGNATURE_FAILED: 'SIGNATURE_FAILED',
    INVALID_VALUE: 'INVALID_VALUE',
    TIMEOUT: 'TIMEOUT',
} as const;

export type FHEVMErrorCode = typeof FHEVM_ERROR_CODES[keyof typeof FHEVM_ERROR_CODES];

export function createFHEVMError(
    code: FHEVMErrorCode,
    message: string,
    details?: any
): FHEVMError {
    return new FHEVMError(message, code, details);
}

export function isFHEVMError(error: any): error is FHEVMError {
    return error instanceof FHEVMError;
}
