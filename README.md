# Universal FHEVM SDK

A framework-agnostic frontend toolkit that helps developers run confidential dApps with ease. Built for the Zama Developer Program October 2025 Bounty Track.

## 🚀 Features

- **🔒 End-to-End Encryption**: Secure encryption and decryption of sensitive data
- **⚡ Framework Agnostic**: Works with React, Vue, Node.js, and any frontend setup
- **🎯 Wagmi-like API**: Intuitive structure familiar to web3 developers
- **🛡️ Production Ready**: Built on Zama's official FHEVM infrastructure
- **📦 Multiple Examples**: Next.js, Vue, and Node.js implementations
- **🧪 Comprehensive Testing**: Full test coverage and CI/CD pipeline

## 📦 Packages

- `packages/fhevm-sdk/` - Enhanced SDK with universal features
- `packages/nextjs/` - Enhanced Next.js application with modern UI
- `packages/vue-example/` - Vue 3 example with Composition API
- `packages/node-example/` - Node.js server-side example
- `packages/hardhat/` - Smart contracts and deployment

## 🛠️ Quick Start

### Prerequisites

- **Node.js** (v20 or higher)
- **pnpm** package manager
- **MetaMask** browser extension (for frontend examples)
- **Git** for cloning the repository

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fhevm-react-template

# Initialize submodules
git submodule update --init --recursive

# Install dependencies
pnpm install
```

### Environment Setup

Set up your environment variables:

```bash
# .env file
MNEMONIC=your_wallet_mnemonic_phrase
INFURA_API_KEY=your_infura_api_key
```

### Running Examples

#### Next.js Example (Recommended)

```bash
# Start local Hardhat node
pnpm chain

# Deploy contracts to localhost
pnpm deploy:localhost

# Start the Next.js frontend
pnpm start
```

#### Vue Example

```bash
# Start Vue development server
pnpm start:vue
```

#### Node.js Example

```bash
# Run Node.js example
pnpm start:node
```

## 🔧 Universal SDK Usage

### Core SDK (Framework Agnostic)

```typescript
import { createFHEVM } from '@fhevm-sdk/universal';
import { BrowserProvider } from 'ethers';

// Initialize FHEVM
const fhevm = createFHEVM('ethers');
await fhevm.initialize({
  chainId: 1,
  provider: new BrowserProvider(window.ethereum),
});

// Encrypt data
const encrypted = await fhevm.encrypt('Hello FHEVM!');

// Decrypt data
const decrypted = await fhevm.decrypt(encrypted);
console.log(decrypted.value); // 'Hello FHEVM!'
```

### React Integration

```tsx
import { useFHEVM } from '@fhevm-sdk/react';

function MyComponent() {
  const { initialize, encrypt, decrypt, instance } = useFHEVM();
  
  // Use the SDK...
}
```

### Vue Integration

```vue
<script setup>
import { useFHEVM } from '@fhevm-sdk/vue';

const { initialize, encrypt, decrypt } = useFHEVM();
</script>
```

### Node.js Integration

```typescript
import { createFHEVM } from '@fhevm-sdk/universal';

const fhevm = createFHEVM('ethers');
await fhevm.initialize({
  chainId: 1,
  provider: new JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo'),
});
```

## 🏗️ Architecture

### Enhanced FHEVM SDK

The SDK now includes:

- **Universal Core**: Framework-agnostic core functionality
- **Provider Support**: Both Ethers.js and Viem support
- **TypeScript First**: Full type safety and excellent developer experience
- **Error Handling**: Comprehensive error handling with custom types
- **Utilities**: Helper functions for validation and formatting

### Framework Adapters

- **React**: Hooks, context, and pre-built components
- **Vue**: Composables and reactive state management
- **Node.js**: Server-side encryption/decryption utilities

## 🎨 Examples

### Next.js Application

- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Wallet Integration**: RainbowKit for seamless wallet connection
- **Live Demo**: Real-time encryption/decryption demonstration
- **FHECounter Contract**: Interactive contract example

### Vue Application

- **Vue 3 Composition API**: Modern Vue.js implementation
- **Reactive State**: Full reactivity with Vue's reactivity system
- **Component-based**: Modular component architecture

### Node.js Application

- **Server-side Encryption**: Complete server-side implementation
- **Batch Operations**: Batch encryption/decryption examples
- **CLI Interface**: Command-line interface for testing

## 🔧 Development

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm sdk:build
```

### Testing

```bash
# Run tests
pnpm test

# Run SDK tests
pnpm sdk:test
```

### Linting

```bash
# Lint all packages
pnpm lint
```

## 🚀 Deployment

### Frontend Examples

- **Next.js**: Deploy to Vercel, Netlify, or any static hosting
- **Vue**: Deploy to Vercel, Netlify, or any static hosting

### Node.js Example

- **Railway**: Serverless deployment
- **Heroku**: Traditional deployment
- **Docker**: Container deployment

## 📚 API Reference

### Core Methods

#### `initialize(config: FHEVMConfig): Promise<FHEVMInstance>`
Initializes the FHEVM instance with the provided configuration.

#### `encrypt(value: string | number | boolean, options?: EncryptionOptions): Promise<EncryptedValue>`
Encrypts a value and returns the encrypted data with signature.

#### `decrypt(encryptedValue: EncryptedValue, options?: DecryptionOptions): Promise<DecryptionResult>`
Decrypts an encrypted value and returns the original data.

#### `getPublicKey(): Promise<string>`
Retrieves the public key for encryption.

#### `signMessage(message: string): Promise<string>`
Signs a message using the connected wallet.

### Configuration

```typescript
interface FHEVMConfig {
  chainId: number;
  publicClient?: PublicClient;      // For Viem
  walletClient?: WalletClient;      // For Viem
  provider?: BrowserProvider;       // For Ethers
  relayerUrl?: string;              // Optional relayer
  contractAddress?: string;         // Contract address
}
```

## 🧪 Testing

### Test Coverage

- **Unit Tests**: Comprehensive unit test coverage
- **Integration Tests**: Cross-package integration tests
- **Example Tests**: All examples are tested
- **Error Tests**: Error condition testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm sdk:test
pnpm hardhat:test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Zama Developer Program October 2025 Bounty Track
- Based on Zama's official FHEVM infrastructure
- Inspired by wagmi's excellent developer experience

## 🔗 Links

- [Zama Official Website](https://zama.ai)
- [FHEVM Documentation](https://docs.zama.ai)
- [GitHub Repository](https://github.com/your-username/fhevm-react-template)
- [Live Demo](https://your-demo-url.com)

---

**Built with ❤️ for the Zama Developer Program**