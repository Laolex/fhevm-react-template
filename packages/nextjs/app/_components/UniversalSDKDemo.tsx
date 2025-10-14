"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { FHEVMCore, createFHEVM, FHEVMError } from "@fhevm-sdk/universal";

export const UniversalSDKDemo = () => {
    const { isConnected, chain } = useAccount();
    const [fhevm, setFhevm] = useState<FHEVMCore | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Demo state
    const [inputValue, setInputValue] = useState("Hello Universal FHEVM!");
    const [encryptedValue, setEncryptedValue] = useState<any>(null);
    const [decryptedValue, setDecryptedValue] = useState<any>(null);
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);

    // Initialize FHEVM when wallet connects
    useEffect(() => {
        if (isConnected && chain && typeof window !== 'undefined') {
            initializeFHEVM();
        }
    }, [isConnected, chain]);

    const initializeFHEVM = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const fhevmInstance = createFHEVM('ethers');

            // Get the provider from window.ethereum
            const provider = (window as any).ethereum;

            await fhevmInstance.initialize({
                chainId: chain?.id || 1,
                provider: provider,
            });

            setFhevm(fhevmInstance);
            setIsInitialized(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize FHEVM');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEncrypt = useCallback(async () => {
        if (!fhevm) return;

        setIsEncrypting(true);
        setError(null);

        try {
            const encrypted = await fhevm.encrypt(inputValue);
            setEncryptedValue(encrypted);
            setDecryptedValue(null); // Reset decrypted value
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Encryption failed');
        } finally {
            setIsEncrypting(false);
        }
    }, [fhevm, inputValue]);

    const handleDecrypt = useCallback(async () => {
        if (!fhevm || !encryptedValue) return;

        setIsDecrypting(true);
        setError(null);

        try {
            const result = await fhevm.decrypt(encryptedValue);
            setDecryptedValue(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Decryption failed');
        } finally {
            setIsDecrypting(false);
        }
    }, [fhevm, encryptedValue]);

    const handleReset = useCallback(() => {
        setEncryptedValue(null);
        setDecryptedValue(null);
        setError(null);
    }, []);

    const buttonClass = "inline-flex items-center justify-center px-6 py-3 font-semibold shadow-lg transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

    const primaryButtonClass = buttonClass + " bg-[#FFD208] text-[#2D2D2D] hover:bg-[#A38025] focus-visible:ring-[#2D2D2D] cursor-pointer";
    const secondaryButtonClass = buttonClass + " bg-black text-[#F4F4F4] hover:bg-[#1F1F1F] focus-visible:ring-[#FFD208] cursor-pointer";
    const dangerButtonClass = buttonClass + " bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 cursor-pointer";

    if (!isConnected) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-center">
                    <div className="bg-white border shadow-xl p-8 text-center rounded-lg">
                        <div className="mb-4">
                            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 text-3xl">
                                🔐
                            </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Connect Wallet to Continue</h2>
                        <p className="text-gray-700 mb-6">Connect your wallet to experience the Universal FHEVM SDK.</p>
                        <div className="flex items-center justify-center">
                            <RainbowKitCustomConnectButton />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* SDK Status */}
            <div className="bg-white border shadow-lg p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-900">🔧 SDK Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                        <span className="font-medium text-gray-700">FHEVM Instance</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isInitialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {isInitialized ? '✅ Initialized' : '❌ Not Initialized'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                        <span className="font-medium text-gray-700">Chain ID</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {chain?.id || 'Unknown'}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">Error: {error}</p>
                    </div>
                )}
            </div>

            {/* Encryption Demo */}
            <div className="bg-white border shadow-lg p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-900">🔒 Encryption/Decryption Demo</h3>

                {/* Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value to encrypt:
                    </label>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter value to encrypt"
                    />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                        className={primaryButtonClass}
                        disabled={!isInitialized || isEncrypting}
                        onClick={handleEncrypt}
                    >
                        {isEncrypting ? '⏳ Encrypting...' : '🔒 Encrypt'}
                    </button>

                    <button
                        className={secondaryButtonClass}
                        disabled={!encryptedValue || isDecrypting || !isInitialized}
                        onClick={handleDecrypt}
                    >
                        {isDecrypting ? '⏳ Decrypting...' : '🔓 Decrypt'}
                    </button>

                    <button
                        className={dangerButtonClass}
                        onClick={handleReset}
                    >
                        🔄 Reset
                    </button>
                </div>

                {/* Results */}
                {encryptedValue && (
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-gray-800">Encrypted Value:</h4>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all">
                                {JSON.stringify(encryptedValue, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {decryptedValue && (
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-gray-800">Decrypted Value:</h4>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-green-800 font-medium">
                                {decryptedValue.success ? decryptedValue.value : `Error: ${decryptedValue.error}`}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Start Code */}
            <div className="bg-white border shadow-lg p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-900">🚀 Quick Start (10 Lines)</h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-green-400 text-sm">
                        {`import { createFHEVM } from '@fhevm-sdk/universal';

const fhevm = createFHEVM('ethers');
await fhevm.initialize({
  chainId: 1,
  provider: window.ethereum,
});

const encrypted = await fhevm.encrypt('Hello World!');
const decrypted = await fhevm.decrypt(encrypted);
console.log(decrypted.value); // 'Hello World!'`}
                    </pre>
                </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">🔒</div>
                    <h4 className="font-semibold text-blue-900">End-to-End Encryption</h4>
                    <p className="text-sm text-blue-700">Secure encryption and decryption of sensitive data</p>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-semibold text-green-900">Framework Agnostic</h4>
                    <p className="text-sm text-green-700">Works with React, Vue, Node.js, and more</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-semibold text-purple-900">Wagmi-like API</h4>
                    <p className="text-sm text-purple-700">Familiar API structure for web3 developers</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">🛡️</div>
                    <h4 className="font-semibold text-orange-900">Production Ready</h4>
                    <p className="text-sm text-orange-700">Built on Zama's official FHEVM infrastructure</p>
                </div>
            </div>
        </div>
    );
};
