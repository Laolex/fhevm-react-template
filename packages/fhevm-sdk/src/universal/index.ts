// Core exports
export { FHEVMCore } from './core';
export { FHEVMError, createFHEVMError, FHEVM_ERROR_CODES } from './errors';
export type { FHEVMErrorCode } from './errors';

// Type exports
export type {
    FHEVMConfig,
    EncryptedValue,
    DecryptionResult,
    FHEVMInstance,
    EncryptionOptions,
    DecryptionOptions,
    ContractCallOptions,
    FHEVMError as FHEVMErrorType,
    FHEVMProvider,
    FHEVMAdapter,
    FHEVMHook,
    FHEVMContextValue,
} from './types';

// Utility exports
export {
    validateConfig,
    validateValue,
    validateEncryptedValue,
    createTimeoutPromise,
    formatValue,
    parseValue,
    isBrowser,
    isNode,
    getDefaultTimeout,
    sanitizeConfig,
} from './utils';

// Factory function for easy initialization
export function createFHEVM(provider: 'ethers' | 'viem' = 'ethers'): FHEVMCore {
    return new FHEVMCore(provider);
}

// Default export
export default FHEVMCore;
