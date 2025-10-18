import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { PublicClient, WalletClient } from 'viem';
import { FHEVMError, createFHEVMError, FHEVM_ERROR_CODES } from './errors';
import {
    FHEVMConfig,
    FHEVMInstance,
    EncryptedValue,
    DecryptionResult,
    EncryptionOptions,
    DecryptionOptions,
    ContractCallOptions,
    FHEVMProvider
} from './types';
import {
    validateConfig,
    validateValue,
    validateEncryptedValue,
    createTimeoutPromise,
    formatValue,
    parseValue,
    getDefaultTimeout,
    sanitizeConfig,
    retryWithExponentialBackoff
} from './utils';

export class FHEVMCore {
    private instance: FHEVMInstance | null = null;
    private provider: FHEVMProvider = 'ethers';

    constructor(provider: FHEVMProvider = 'ethers') {
        this.provider = provider;
    }

    async initialize(config: FHEVMConfig): Promise<FHEVMInstance> {
        try {
            const sanitizedConfig = sanitizeConfig(config);
            validateConfig(sanitizedConfig);

            // Initialize FHEVM instance based on provider
            let fhevmInstance: any;

            if (this.provider === 'ethers') {
                fhevmInstance = await this.initializeEthers(sanitizedConfig);
            } else if (this.provider === 'viem') {
                fhevmInstance = await this.initializeViem(sanitizedConfig);
            } else {
                throw createFHEVMError(
                    FHEVM_ERROR_CODES.INVALID_PROVIDER,
                    `Unsupported provider: ${this.provider}`
                );
            }

            this.instance = {
                config: sanitizedConfig,
                isInitialized: true,
                contract: fhevmInstance.contract,
                relayer: fhevmInstance.relayer,
            };

            return this.instance;
        } catch (error) {
            if (error instanceof FHEVMError) {
                throw error;
            }
            throw createFHEVMError(
                FHEVM_ERROR_CODES.NETWORK_ERROR,
                `Failed to initialize FHEVM: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error
            );
        }
    }

    private async initializeEthers(config: FHEVMConfig): Promise<any> {
        // Import from the existing FHEVM SDK structure
        const { FhevmInstance } = await import('../core/index.js');

        if (!config.provider) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.INVALID_CONFIG,
                'Ethers provider is required for ethers initialization'
            );
        }

        const instance = await FhevmInstance.createFhevmInstance({
            chainId: config.chainId,
            publicKey: await this.getPublicKeyEthers(config.provider),
        });

        return {
            contract: instance,
            relayer: config.relayerUrl ? await this.initializeRelayer(config.relayerUrl) : null,
        };
    }

    private async initializeViem(config: FHEVMConfig): Promise<any> {
        // Import from the existing FHEVM SDK structure
        const { FhevmInstance } = await import('../core/index.js');

        if (!config.publicClient || !config.walletClient) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.INVALID_CONFIG,
                'Viem publicClient and walletClient are required for viem initialization'
            );
        }

        const instance = await FhevmInstance.createFhevmInstance({
            chainId: config.chainId,
            publicKey: await this.getPublicKeyViem(config.publicClient),
        });

        return {
            contract: instance,
            relayer: config.relayerUrl ? await this.initializeRelayer(config.relayerUrl) : null,
        };
    }

    private async getPublicKeyEthers(provider: BrowserProvider | JsonRpcProvider): Promise<string> {
        try {
            // Import from the existing FHEVM SDK structure
            const { FhevmInstance } = await import('../core/index.js');
            return await FhevmInstance.createFhevmInstance({
                chainId: 1, // Temporary, will be updated with actual chainId
            }).then(instance => instance.getPublicKey());
        } catch (error) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.NETWORK_ERROR,
                `Failed to get public key: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error
            );
        }
    }

    private async getPublicKeyViem(publicClient: PublicClient): Promise<string> {
        try {
            // Import from the existing FHEVM SDK structure
            const { FhevmInstance } = await import('../core/index.js');
            return await FhevmInstance.createFhevmInstance({
                chainId: publicClient.chain?.id || 1,
            }).then(instance => instance.getPublicKey());
        } catch (error) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.NETWORK_ERROR,
                `Failed to get public key: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error
            );
        }
    }

    private async initializeRelayer(relayerUrl: string): Promise<any> {
        try {
            // Import from the existing FHEVM SDK structure
            const { Relayer } = await import('../core/index.js');
            return new Relayer(relayerUrl);
        } catch (error) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.NETWORK_ERROR,
                `Failed to initialize relayer: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error
            );
        }
    }

    async encrypt(value: string | number | boolean, options: EncryptionOptions = {}): Promise<EncryptedValue> {
        this.ensureInitialized();
        validateValue(value);

        try {
            const formattedValue = formatValue(value);
            const encrypted = await this.instance!.contract.encrypt(formattedValue);

            return {
                data: encrypted.data,
                signature: encrypted.signature,
            };
        } catch (error) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.ENCRYPTION_FAILED,
                `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error
            );
        }
    }

    async decrypt(encryptedValue: EncryptedValue, options: DecryptionOptions = {}): Promise<DecryptionResult> {
        this.ensureInitialized();
        validateEncryptedValue(encryptedValue);

        try {
            const timeout = options.timeout || getDefaultTimeout();
            const maxRetries = (options as any).maxRetries || 3;

            const result = await retryWithExponentialBackoff(
                async () => {
                    const decryptPromise = this.instance!.contract.decrypt(
                        encryptedValue.data,
                        encryptedValue.signature
                    );

                    return await createTimeoutPromise(
                        decryptPromise,
                        timeout,
                        'Decryption timeout'
                    );
                },
                {
                    maxRetries,
                    initialDelay: 1000,
                    onRetry: (attempt, error) => {
                        console.warn(`Decryption attempt ${attempt} failed, retrying...`, error.message);
                    }
                }
            );

            return {
                value: result,
                success: true,
            };
        } catch (error) {
            return {
                value: '',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async callContract(method: string, params: any[] = [], options: ContractCallOptions = {}): Promise<any> {
        this.ensureInitialized();

        try {
            if (!this.instance!.config.contractAddress) {
                throw createFHEVMError(
                    FHEVM_ERROR_CODES.INVALID_CONFIG,
                    'Contract address is required for contract calls'
                );
            }

            const contract = this.instance!.contract;
            const result = await contract[method](...params, {
                gasLimit: options.gasLimit,
                gasPrice: options.gasPrice,
                value: options.value,
            });

            return result;
        } catch (error) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.CONTRACT_CALL_FAILED,
                `Contract call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error
            );
        }
    }

    async getPublicKey(): Promise<string> {
        this.ensureInitialized();

        try {
            return await this.instance!.contract.getPublicKey();
        } catch (error) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.NETWORK_ERROR,
                `Failed to get public key: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error
            );
        }
    }

    async signMessage(message: string): Promise<string> {
        this.ensureInitialized();

        try {
            if (this.provider === 'ethers' && this.instance!.config.provider) {
                const signer = await this.instance!.config.provider.getSigner();
                return await signer.signMessage(message);
            } else if (this.provider === 'viem' && this.instance!.config.walletClient) {
                // Get the account from wallet client
                const account = this.instance!.config.walletClient.account;
                if (!account) {
                    throw createFHEVMError(
                        FHEVM_ERROR_CODES.INVALID_PROVIDER,
                        'No account connected to wallet client'
                    );
                }

                return await this.instance!.config.walletClient.signMessage({
                    account,
                    message,
                });
            } else {
                throw createFHEVMError(
                    FHEVM_ERROR_CODES.INVALID_PROVIDER,
                    'No valid signer available'
                );
            }
        } catch (error) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.SIGNATURE_FAILED,
                `Signature failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error
            );
        }
    }

    getInstance(): FHEVMInstance | null {
        return this.instance;
    }

    isInitialized(): boolean {
        return this.instance?.isInitialized || false;
    }

    reset(): void {
        this.instance = null;
    }

    async encryptBatch(
        values: Array<string | number | boolean>,
        options: EncryptionOptions = {}
    ): Promise<EncryptedValue[]> {
        this.ensureInitialized();

        if (!Array.isArray(values) || values.length === 0) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.INVALID_VALUE,
                'Values must be a non-empty array'
            );
        }

        const batchSize = (options as any).batchSize || 5;
        const results: EncryptedValue[] = [];

        for (let i = 0; i < values.length; i += batchSize) {
            const batch = values.slice(i, i + batchSize);
            const encrypted = await Promise.all(
                batch.map(value => this.encrypt(value, options))
            );
            results.push(...encrypted);
        }

        return results;
    }

    async decryptBatch(
        encryptedValues: EncryptedValue[],
        options: DecryptionOptions = {}
    ): Promise<DecryptionResult[]> {
        this.ensureInitialized();

        if (!Array.isArray(encryptedValues) || encryptedValues.length === 0) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.INVALID_VALUE,
                'Encrypted values must be a non-empty array'
            );
        }

        const batchSize = (options as any).batchSize || 5;
        const results: DecryptionResult[] = [];

        for (let i = 0; i < encryptedValues.length; i += batchSize) {
            const batch = encryptedValues.slice(i, i + batchSize);
            const decrypted = await Promise.all(
                batch.map(value => this.decrypt(value, options))
            );
            results.push(...decrypted);
        }

        return results;
    }

    private ensureInitialized(): void {
        if (!this.instance || !this.instance.isInitialized) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.NOT_INITIALIZED,
                'FHEVM instance is not initialized. Call initialize() first.'
            );
        }
    }
}
