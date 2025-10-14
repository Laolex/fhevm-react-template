import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { PublicClient, WalletClient } from 'viem';

export interface FHEVMConfig {
    chainId: number;
    publicClient?: PublicClient;
    walletClient?: WalletClient;
    provider?: BrowserProvider | JsonRpcProvider;
    relayerUrl?: string;
    contractAddress?: string;
}

export interface EncryptedValue {
    data: string;
    signature: string;
}

export interface DecryptionResult {
    value: string | number | boolean;
    success: boolean;
    error?: string;
}

export interface FHEVMInstance {
    config: FHEVMConfig;
    isInitialized: boolean;
    contract?: any;
    relayer?: any;
}

export interface EncryptionOptions {
    gasLimit?: number;
    gasPrice?: string;
    nonce?: number;
}

export interface DecryptionOptions {
    usePublicKey?: boolean;
    timeout?: number;
}

export interface ContractCallOptions {
    gasLimit?: number;
    gasPrice?: string;
    value?: string;
}

export interface FHEVMError extends Error {
    code: string;
    details?: any;
}

export type FHEVMProvider = 'ethers' | 'viem';

export interface FHEVMAdapter {
    provider: FHEVMProvider;
    initialize(config: FHEVMConfig): Promise<FHEVMInstance>;
    encrypt(value: string | number | boolean, options?: EncryptionOptions): Promise<EncryptedValue>;
    decrypt(encryptedValue: EncryptedValue, options?: DecryptionOptions): Promise<DecryptionResult>;
    callContract(method: string, params: any[], options?: ContractCallOptions): Promise<any>;
    getPublicKey(): Promise<string>;
    signMessage(message: string): Promise<string>;
}

export interface FHEVMHook {
    instance: FHEVMInstance | null;
    isLoading: boolean;
    error: FHEVMError | null;
    initialize: (config: FHEVMConfig) => Promise<void>;
    encrypt: (value: string | number | boolean, options?: EncryptionOptions) => Promise<EncryptedValue>;
    decrypt: (encryptedValue: EncryptedValue, options?: DecryptionOptions) => Promise<DecryptionResult>;
    callContract: (method: string, params: any[], options?: ContractCallOptions) => Promise<any>;
    reset: () => void;
}

export interface FHEVMContextValue {
    instance: FHEVMInstance | null;
    isLoading: boolean;
    error: FHEVMError | null;
    initialize: (config: FHEVMConfig) => Promise<void>;
    encrypt: (value: string | number | boolean, options?: EncryptionOptions) => Promise<EncryptedValue>;
    decrypt: (encryptedValue: EncryptedValue, options?: DecryptionOptions) => Promise<DecryptionResult>;
    callContract: (method: string, params: any[], options?: ContractCallOptions) => Promise<any>;
    reset: () => void;
}
