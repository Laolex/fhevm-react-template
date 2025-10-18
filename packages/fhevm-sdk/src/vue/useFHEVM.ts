import { ref, readonly, Ref } from 'vue';
import { FHEVMCore } from '../universal/core';
import { FHEVMError } from '../universal/errors';
import {
    FHEVMConfig,
    FHEVMInstance,
    EncryptedValue,
    DecryptionResult,
    EncryptionOptions,
    DecryptionOptions,
    ContractCallOptions,
    FHEVMProvider
} from '../universal/types';

export interface UseFHEVMReturn {
    instance: Ref<FHEVMInstance | null>;
    isLoading: Ref<boolean>;
    error: Ref<FHEVMError | null>;
    isInitialized: Ref<boolean>;
    initialize: (config: FHEVMConfig) => Promise<void>;
    encrypt: (value: string | number | boolean, options?: EncryptionOptions) => Promise<EncryptedValue>;
    decrypt: (encryptedValue: EncryptedValue, options?: DecryptionOptions) => Promise<DecryptionResult>;
    encryptBatch: (values: Array<string | number | boolean>, options?: EncryptionOptions) => Promise<EncryptedValue[]>;
    decryptBatch: (encryptedValues: EncryptedValue[], options?: DecryptionOptions) => Promise<DecryptionResult[]>;
    callContract: (method: string, params: any[], options?: ContractCallOptions) => Promise<any>;
    getPublicKey: () => Promise<string>;
    signMessage: (message: string) => Promise<string>;
    reset: () => void;
}

export function useFHEVM(provider: FHEVMProvider = 'ethers'): UseFHEVMReturn {
    const fhevm = new FHEVMCore(provider);

    const instance = ref<FHEVMInstance | null>(null);
    const isLoading = ref(false);
    const error = ref<FHEVMError | null>(null);
    const isInitialized = ref(false);

    const initialize = async (config: FHEVMConfig): Promise<void> => {
        isLoading.value = true;
        error.value = null;

        try {
            const result = await fhevm.initialize(config);
            instance.value = result;
            isInitialized.value = true;
        } catch (err) {
            error.value = err instanceof FHEVMError ? err : new FHEVMError(
                err instanceof Error ? err.message : 'Unknown error',
                'INITIALIZATION_ERROR'
            );
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const encrypt = async (
        value: string | number | boolean,
        options?: EncryptionOptions
    ): Promise<EncryptedValue> => {
        error.value = null;
        try {
            return await fhevm.encrypt(value, options);
        } catch (err) {
            error.value = err instanceof FHEVMError ? err : new FHEVMError(
                err instanceof Error ? err.message : 'Encryption failed',
                'ENCRYPTION_ERROR'
            );
            throw err;
        }
    };

    const decrypt = async (
        encryptedValue: EncryptedValue,
        options?: DecryptionOptions
    ): Promise<DecryptionResult> => {
        error.value = null;
        try {
            return await fhevm.decrypt(encryptedValue, options);
        } catch (err) {
            error.value = err instanceof FHEVMError ? err : new FHEVMError(
                err instanceof Error ? err.message : 'Decryption failed',
                'DECRYPTION_ERROR'
            );
            throw err;
        }
    };

    const encryptBatch = async (
        values: Array<string | number | boolean>,
        options?: EncryptionOptions
    ): Promise<EncryptedValue[]> => {
        error.value = null;
        try {
            return await fhevm.encryptBatch(values, options);
        } catch (err) {
            error.value = err instanceof FHEVMError ? err : new FHEVMError(
                err instanceof Error ? err.message : 'Batch encryption failed',
                'ENCRYPTION_ERROR'
            );
            throw err;
        }
    };

    const decryptBatch = async (
        encryptedValues: EncryptedValue[],
        options?: DecryptionOptions
    ): Promise<DecryptionResult[]> => {
        error.value = null;
        try {
            return await fhevm.decryptBatch(encryptedValues, options);
        } catch (err) {
            error.value = err instanceof FHEVMError ? err : new FHEVMError(
                err instanceof Error ? err.message : 'Batch decryption failed',
                'DECRYPTION_ERROR'
            );
            throw err;
        }
    };

    const callContract = async (
        method: string,
        params: any[] = [],
        options?: ContractCallOptions
    ): Promise<any> => {
        error.value = null;
        try {
            return await fhevm.callContract(method, params, options);
        } catch (err) {
            error.value = err instanceof FHEVMError ? err : new FHEVMError(
                err instanceof Error ? err.message : 'Contract call failed',
                'CONTRACT_ERROR'
            );
            throw err;
        }
    };

    const getPublicKey = async (): Promise<string> => {
        error.value = null;
        try {
            return await fhevm.getPublicKey();
        } catch (err) {
            error.value = err instanceof FHEVMError ? err : new FHEVMError(
                err instanceof Error ? err.message : 'Failed to get public key',
                'NETWORK_ERROR'
            );
            throw err;
        }
    };

    const signMessage = async (message: string): Promise<string> => {
        error.value = null;
        try {
            return await fhevm.signMessage(message);
        } catch (err) {
            error.value = err instanceof FHEVMError ? err : new FHEVMError(
                err instanceof Error ? err.message : 'Failed to sign message',
                'SIGNATURE_ERROR'
            );
            throw err;
        }
    };

    const reset = (): void => {
        fhevm.reset();
        instance.value = null;
        isInitialized.value = false;
        error.value = null;
    };

    return {
        instance: readonly(instance) as Readonly<Ref<FHEVMInstance | null>>,
        isLoading,
        error,
        isInitialized,
        initialize,
        encrypt,
        decrypt,
        encryptBatch,
        decryptBatch,
        callContract,
        getPublicKey,
        signMessage,
        reset,
    };
}
