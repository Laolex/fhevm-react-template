import { createFHEVMError, FHEVM_ERROR_CODES } from './errors';
import { FHEVMConfig } from './types';

export function validateConfig(config: FHEVMConfig): void {
    if (!config) {
        throw createFHEVMError(
            FHEVM_ERROR_CODES.INVALID_CONFIG,
            'Configuration is required'
        );
    }

    if (!config.chainId || typeof config.chainId !== 'number') {
        throw createFHEVMError(
            FHEVM_ERROR_CODES.INVALID_CONFIG,
            'Valid chainId is required'
        );
    }

    if (!config.publicClient && !config.walletClient && !config.provider) {
        throw createFHEVMError(
            FHEVM_ERROR_CODES.INVALID_CONFIG,
            'At least one provider (publicClient, walletClient, or provider) is required'
        );
    }
}

export function validateValue(value: any): void {
    if (value === null || value === undefined) {
        throw createFHEVMError(
            FHEVM_ERROR_CODES.INVALID_VALUE,
            'Value cannot be null or undefined'
        );
    }

    const type = typeof value;
    if (!['string', 'number', 'boolean'].includes(type)) {
        throw createFHEVMError(
            FHEVM_ERROR_CODES.INVALID_VALUE,
            `Value must be a string, number, or boolean, got ${type}`
        );
    }
}

export function validateEncryptedValue(encryptedValue: any): void {
    if (!encryptedValue || typeof encryptedValue !== 'object') {
        throw createFHEVMError(
            FHEVM_ERROR_CODES.INVALID_VALUE,
            'Encrypted value must be an object'
        );
    }

    if (!encryptedValue.data || typeof encryptedValue.data !== 'string') {
        throw createFHEVMError(
            FHEVM_ERROR_CODES.INVALID_VALUE,
            'Encrypted value must have a data property of type string'
        );
    }

    if (!encryptedValue.signature || typeof encryptedValue.signature !== 'string') {
        throw createFHEVMError(
            FHEVM_ERROR_CODES.INVALID_VALUE,
            'Encrypted value must have a signature property of type string'
        );
    }
}

export function createTimeoutPromise<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => {
                reject(createFHEVMError(FHEVM_ERROR_CODES.TIMEOUT, errorMessage));
            }, timeoutMs)
        ),
    ]);
}

export function formatValue(value: string | number | boolean): string {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number') {
        return value.toString();
    }
    if (typeof value === 'boolean') {
        return value ? '1' : '0';
    }
    throw createFHEVMError(
        FHEVM_ERROR_CODES.INVALID_VALUE,
        `Cannot format value of type ${typeof value}`
    );
}

export function parseValue(value: string, expectedType: 'string' | 'number' | 'boolean'): string | number | boolean {
    switch (expectedType) {
        case 'string':
            return value;
        case 'number':
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw createFHEVMError(
                    FHEVM_ERROR_CODES.INVALID_VALUE,
                    `Cannot parse "${value}" as number`
                );
            }
            return num;
        case 'boolean':
            if (value === '1' || value === 'true') {
                return true;
            }
            if (value === '0' || value === 'false') {
                return false;
            }
            throw createFHEVMError(
                FHEVM_ERROR_CODES.INVALID_VALUE,
                `Cannot parse "${value}" as boolean`
            );
        default:
            throw createFHEVMError(
                FHEVM_ERROR_CODES.INVALID_VALUE,
                `Unknown expected type: ${expectedType}`
            );
    }
}

export function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

export function isNode(): boolean {
    return typeof process !== 'undefined' && process.versions && process.versions.node;
}

export function getDefaultTimeout(): number {
    return 30000; // 30 seconds
}

export function sanitizeConfig(config: FHEVMConfig): FHEVMConfig {
    return {
        ...config,
        relayerUrl: config.relayerUrl?.replace(/\/$/, ''), // Remove trailing slash
    };
}
