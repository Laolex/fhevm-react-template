import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FHEVMCore } from '../src/universal/core';
import { FHEVMError, FHEVM_ERROR_CODES } from '../src/universal/errors';

describe('FHEVMCore', () => {
    let fhevm: FHEVMCore;

    beforeEach(() => {
        fhevm = new FHEVMCore('ethers');
    });

    describe('Constructor', () => {
        it('should create instance with ethers provider', () => {
            const instance = new FHEVMCore('ethers');
            expect(instance).toBeInstanceOf(FHEVMCore);
            expect(instance.isInitialized()).toBe(false);
        });

        it('should create instance with viem provider', () => {
            const instance = new FHEVMCore('viem');
            expect(instance).toBeInstanceOf(FHEVMCore);
            expect(instance.isInitialized()).toBe(false);
        });
    });

    describe('Initialization', () => {
        it('should throw error when not initialized', () => {
            expect(() => {
                // @ts-expect-error - testing private method
                fhevm.ensureInitialized();
            }).toThrow(FHEVMError);
        });

        it('should validate config with missing chainId', async () => {
            await expect(
                fhevm.initialize({} as any)
            ).rejects.toThrow('Valid chainId is required');
        });

        it('should validate config with missing provider', async () => {
            await expect(
                fhevm.initialize({ chainId: 1 } as any)
            ).rejects.toThrow('At least one provider');
        });

        it('should detect sensitive keys in browser environment', async () => {
            // Mock browser environment
            const originalWindow = global.window;
            (global as any).window = { document: {} };

            const fhevmBrowser = new FHEVMCore('ethers');

            await expect(
                fhevmBrowser.initialize({
                    chainId: 1,
                    provider: {} as any,
                    relayerKey: 'secret' as any
                })
            ).rejects.toThrow('Sensitive keys detected');

            // Restore
            if (originalWindow === undefined) {
                delete (global as any).window;
            } else {
                global.window = originalWindow;
            }
        });
    });

    describe('Validation', () => {
        it('should validate null values', () => {
            expect(() => {
                const { validateValue } = require('../src/universal/utils');
                validateValue(null);
            }).toThrow('Value cannot be null or undefined');
        });

        it('should validate undefined values', () => {
            expect(() => {
                const { validateValue } = require('../src/universal/utils');
                validateValue(undefined);
            }).toThrow('Value cannot be null or undefined');
        });

        it('should validate invalid value types', () => {
            expect(() => {
                const { validateValue } = require('../src/universal/utils');
                validateValue({});
            }).toThrow('Value must be a string, number, or boolean');
        });

        it('should accept valid string values', () => {
            const { validateValue } = require('../src/universal/utils');
            expect(() => validateValue('test')).not.toThrow();
        });

        it('should accept valid number values', () => {
            const { validateValue } = require('../src/universal/utils');
            expect(() => validateValue(123)).not.toThrow();
        });

        it('should accept valid boolean values', () => {
            const { validateValue } = require('../src/universal/utils');
            expect(() => validateValue(true)).not.toThrow();
        });
    });

    describe('Encrypted Value Validation', () => {
        it('should validate encrypted value structure', () => {
            const { validateEncryptedValue } = require('../src/universal/utils');

            expect(() => {
                validateEncryptedValue({});
            }).toThrow('Encrypted value must have a data property');

            expect(() => {
                validateEncryptedValue({ data: 'test' });
            }).toThrow('Encrypted value must have a signature property');

            expect(() => {
                validateEncryptedValue({ data: 'test', signature: 'sig' });
            }).not.toThrow();
        });
    });

    describe('Value Formatting', () => {
        it('should format string values', () => {
            const { formatValue } = require('../src/universal/utils');
            expect(formatValue('hello')).toBe('hello');
        });

        it('should format number values', () => {
            const { formatValue } = require('../src/universal/utils');
            expect(formatValue(42)).toBe('42');
        });

        it('should format boolean values', () => {
            const { formatValue } = require('../src/universal/utils');
            expect(formatValue(true)).toBe('1');
            expect(formatValue(false)).toBe('0');
        });
    });

    describe('Value Parsing', () => {
        it('should parse string values', () => {
            const { parseValue } = require('../src/universal/utils');
            expect(parseValue('hello', 'string')).toBe('hello');
        });

        it('should parse number values', () => {
            const { parseValue } = require('../src/universal/utils');
            expect(parseValue('42', 'number')).toBe(42);
        });

        it('should parse boolean values', () => {
            const { parseValue } = require('../src/universal/utils');
            expect(parseValue('1', 'boolean')).toBe(true);
            expect(parseValue('0', 'boolean')).toBe(false);
            expect(parseValue('true', 'boolean')).toBe(true);
            expect(parseValue('false', 'boolean')).toBe(false);
        });

        it('should throw on invalid number parsing', () => {
            const { parseValue } = require('../src/universal/utils');
            expect(() => parseValue('not-a-number', 'number')).toThrow();
        });

        it('should throw on invalid boolean parsing', () => {
            const { parseValue } = require('../src/universal/utils');
            expect(() => parseValue('maybe', 'boolean')).toThrow();
        });
    });

    describe('Retry Logic', () => {
        it('should retry on failure', async () => {
            const { retryWithExponentialBackoff } = require('../src/universal/utils');

            let attempts = 0;
            const fn = vi.fn(async () => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Temporary failure');
                }
                return 'success';
            });

            const result = await retryWithExponentialBackoff(fn, {
                maxRetries: 3,
                initialDelay: 10,
            });

            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(3);
        });

        it('should not retry on invalid errors', async () => {
            const { retryWithExponentialBackoff } = require('../src/universal/utils');

            const fn = vi.fn(async () => {
                throw new Error('Invalid request');
            });

            await expect(
                retryWithExponentialBackoff(fn, { maxRetries: 3, initialDelay: 10 })
            ).rejects.toThrow('Invalid request');

            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should call onRetry callback', async () => {
            const { retryWithExponentialBackoff } = require('../src/universal/utils');

            const onRetry = vi.fn();
            let attempts = 0;

            const fn = async () => {
                attempts++;
                if (attempts < 2) {
                    throw new Error('Network error');
                }
                return 'success';
            };

            await retryWithExponentialBackoff(fn, {
                maxRetries: 3,
                initialDelay: 10,
                onRetry,
            });

            expect(onRetry).toHaveBeenCalledTimes(1);
        });
    });

    describe('Environment Detection', () => {
        it('should detect browser environment', () => {
            const { isBrowser } = require('../src/universal/utils');

            const originalWindow = global.window;
            (global as any).window = { document: {} };

            expect(isBrowser()).toBe(true);

            if (originalWindow === undefined) {
                delete (global as any).window;
            } else {
                global.window = originalWindow;
            }
        });

        it('should detect Node.js environment', () => {
            const { isNode } = require('../src/universal/utils');
            expect(isNode()).toBe(true);
        });
    });

    describe('Config Sanitization', () => {
        it('should remove sensitive keys', () => {
            const { sanitizeConfig } = require('../src/universal/utils');

            const config = {
                chainId: 1,
                relayerKey: 'secret',
                privateKey: 'private',
                apiKey: 'api',
            };

            const sanitized = sanitizeConfig(config);

            expect(sanitized.chainId).toBe(1);
            expect(sanitized.relayerKey).toBeUndefined();
            expect(sanitized.privateKey).toBeUndefined();
            expect(sanitized.apiKey).toBeUndefined();
        });

        it('should remove trailing slash from relayerUrl', () => {
            const { sanitizeConfig } = require('../src/universal/utils');

            const config = {
                chainId: 1,
                relayerUrl: 'https://relayer.example.com/',
            };

            const sanitized = sanitizeConfig(config);
            expect(sanitized.relayerUrl).toBe('https://relayer.example.com');
        });
    });

    describe('Timeout Handling', () => {
        it('should timeout long operations', async () => {
            const { createTimeoutPromise } = require('../src/universal/utils');

            const slowOperation = new Promise((resolve) => {
                setTimeout(() => resolve('done'), 1000);
            });

            await expect(
                createTimeoutPromise(slowOperation, 100, 'Operation timeout')
            ).rejects.toThrow('Operation timeout');
        });

        it('should complete fast operations', async () => {
            const { createTimeoutPromise } = require('../src/universal/utils');

            const fastOperation = new Promise((resolve) => {
                setTimeout(() => resolve('done'), 10);
            });

            const result = await createTimeoutPromise(fastOperation, 1000, 'Timeout');
            expect(result).toBe('done');
        });
    });

    describe('Error Creation', () => {
        it('should create FHEVMError with code', () => {
            const { createFHEVMError, FHEVM_ERROR_CODES } = require('../src/universal/errors');

            const error = createFHEVMError(
                FHEVM_ERROR_CODES.NOT_INITIALIZED,
                'Test error'
            );

            expect(error).toBeInstanceOf(FHEVMError);
            expect(error.code).toBe('NOT_INITIALIZED');
            expect(error.message).toBe('Test error');
        });

        it('should create FHEVMError with details', () => {
            const { createFHEVMError, FHEVM_ERROR_CODES } = require('../src/universal/errors');

            const details = { foo: 'bar' };
            const error = createFHEVMError(
                FHEVM_ERROR_CODES.NETWORK_ERROR,
                'Network failed',
                details
            );

            expect(error.details).toEqual(details);
        });

        it('should identify FHEVMError instances', () => {
            const { createFHEVMError, isFHEVMError, FHEVM_ERROR_CODES } = require('../src/universal/errors');

            const fhevmError = createFHEVMError(FHEVM_ERROR_CODES.INVALID_CONFIG, 'Test');
            const regularError = new Error('Regular error');

            expect(isFHEVMError(fhevmError)).toBe(true);
            expect(isFHEVMError(regularError)).toBe(false);
        });
    });

    describe('Batch Operations', () => {
        it('should validate batch input', async () => {
            await expect(
                fhevm.encryptBatch([] as any)
            ).rejects.toThrow('Values must be a non-empty array');

            await expect(
                fhevm.encryptBatch('not-an-array' as any)
            ).rejects.toThrow('NOT_INITIALIZED');
        });
    });
});
