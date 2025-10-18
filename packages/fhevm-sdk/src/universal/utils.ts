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

    // SECURITY: Warn about sensitive data in browser environments
    if (isBrowser()) {
        if ((config as any).relayerKey || (config as any).privateKey || (config as any).apiKey) {
            console.error(
                '⚠️ SECURITY WARNING: Detected sensitive keys in client-side configuration. ' +
                'Never expose relayer keys, private keys, or API keys in browser environments. ' +
                'Use server-side endpoints or environment variables with proper access controls.'
            );
            throw createFHEVMError(
                FHEVM_ERROR_CODES.INVALID_CONFIG,
                'Sensitive keys detected in browser environment. This is a security risk.'
            );
        }

        // Warn about development patterns in production
        if (config.relayerUrl && config.relayerUrl.includes('localhost')) {
            console.warn(
                '⚠️ WARNING: Using localhost relayer URL in browser. ' +
                'Ensure this is a development environment.'
            );
        }
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
    return typeof process !== 'undefined' &&
           typeof process.versions !== 'undefined' &&
           typeof process.versions.node === 'string';
}

export function getDefaultTimeout(): number {
    return 30000; // 30 seconds
}

export function sanitizeConfig(config: FHEVMConfig): FHEVMConfig {
    // Remove any accidentally included sensitive keys
    const { ...sanitized } = config;
    delete (sanitized as any).relayerKey;
    delete (sanitized as any).privateKey;
    delete (sanitized as any).apiKey;

    return {
        ...sanitized,
        relayerUrl: config.relayerUrl?.replace(/\/$/, ''), // Remove trailing slash
    };
}

export async function retryWithExponentialBackoff<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        initialDelay?: number;
        maxDelay?: number;
        factor?: number;
        onRetry?: (attempt: number, error: any) => void;
    } = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        factor = 2,
        onRetry,
    } = options;

    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on certain errors
            if (error instanceof Error) {
                const message = error.message.toLowerCase();
                if (
                    message.includes('invalid') ||
                    message.includes('unauthorized') ||
                    message.includes('forbidden')
                ) {
                    throw error;
                }
            }

            if (attempt < maxRetries - 1) {
                const delay = Math.min(initialDelay * Math.pow(factor, attempt), maxDelay);
                if (onRetry) {
                    onRetry(attempt + 1, error);
                }
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
