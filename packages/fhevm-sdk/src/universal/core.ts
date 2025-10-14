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
    sanitizeConfig
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
        const { FhevmInstance } = await import('fhevm');

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
        const { FhevmInstance } = await import('fhevm');

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
            const { FhevmInstance } = await import('fhevm');
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
            const { FhevmInstance } = await import('fhevm');
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
            const { Relayer } = await import('fhevm');
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

            const decryptPromise = this.instance!.contract.decrypt(
                encryptedValue.data,
                encryptedValue.signature
            );

            const result = await createTimeoutPromise(
                decryptPromise,
                timeout,
                'Decryption timeout'
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
                return await this.instance!.config.walletClient.signMessage({
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

    private ensureInitialized(): void {
        if (!this.instance || !this.instance.isInitialized) {
            throw createFHEVMError(
                FHEVM_ERROR_CODES.NOT_INITIALIZED,
                'FHEVM instance is not initialized. Call initialize() first.'
            );
        }
    }
}
