import { createFhevmInstance } from "@fhevm-sdk/universal";
import { JsonRpcProvider } from "ethers";

async function main() {
    console.log("Starting E2E smoke test: initialize -> encrypt -> decrypt");

    const rpcUrl = process.env.RPC_URL || "http://localhost:8545";
    const provider = new JsonRpcProvider(rpcUrl);

    const abortController = new AbortController();

    const instance = await createFhevmInstance({
        provider: rpcUrl,
        mockChains: { 31337: rpcUrl },
        signal: abortController.signal,
    });

    console.log("FHEVM instance created. Getting public key...");
    const pubKey = await instance.getPublicKey();
    console.log("Public key:", pubKey?.slice?.(0, 40) || pubKey);

    const toEncrypt = "hello-fhevm-smoke-test";
    console.log("Encrypting value:", toEncrypt);
    const encrypted = await instance.encrypt(toEncrypt as any);
    console.log("Encrypted result:", encrypted?.data ? '[data]' : encrypted);

    console.log("Decrypting... (publicDecrypt or userDecrypt will depend on instance)");
    const decrypted = await instance.decrypt(encrypted as any);

    console.log("Decrypted result:", decrypted);

    if (decrypted && decrypted.value && String(decrypted.value).includes("hello-fhevm-smoke-test")) {
        console.log("SMOKE TEST: SUCCESS");
        process.exit(0);
    }

    console.error("SMOKE TEST: FAILURE - decrypted value mismatch");
    process.exit(2);
}

main().catch(e => {
    console.error("Smoke test failed:", e);
    process.exit(3);
});
