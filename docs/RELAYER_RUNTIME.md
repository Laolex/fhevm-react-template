Relayer runtime and how to provide it

This project uses Zama's relayer SDK to create FHEVM instances in the browser and examples. The SDK is designed to avoid shipping the large relayer mock into production bundles by dynamically loading the relayer SDK (from a CDN or via an installed package).

Options to provide the relayer runtime

1) Browser (recommended for Next.js demo)

- The `RelayerSDKLoader` will try to find `window.relayerSDK`. If it is not present, it will attempt to load the relayer SDK via a CDN URL configured in `packages/fhevm-sdk/src/internal/constants.ts`.
- If you want to provide the relayer yourself instead of relying on CDN, include the relayer script in your page before loading your bundle, e.g. in `<head>`:

  <script src="https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"></script>

2) Local installation (for development or CI)

- Install the relayer SDK locally in the monorepo or the consumer project:

  pnpm add -w @zama-fhe/relayer-sdk@^0.2.0

- In Node-based examples you can `import { Relayer } from '@zama-fhe/relayer-sdk'` and pass relayer URL to the SDK's `initializeRelayer` path (see `createFhevmInstance` logic).

3) Running against a FHEVM Hardhat node

- The SDK detects a FHEVM Hardhat node by calling `web3_clientVersion` and `fhevm_relayer_metadata`. For local dev, run:

  pnpm chain
  pnpm deploy:localhost

- Once the local chain is up, the SDK will initialize a mock instance automatically when you pass the local RPC URL (e.g. `http://localhost:8545`) to `createFhevmInstance`.

Troubleshooting

- If the relayer fails to load from CDN, check network access and the CDN URL. Alternatively, add the relayer SDK as a local dependency and ensure it's available at runtime.
- If `window.relayerSDK` is present but fails validation, inspect `window.relayerSDK.__initialized__` and start from the browser console: `window.relayerSDK.initSDK()`.

Security note

- Do not include a production relayer key in client-side bundles. Use server-side relayer endpoints or secure env vars for relayer secrets.
