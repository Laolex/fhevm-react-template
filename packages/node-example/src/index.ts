import { FHEVMCore, createFHEVM } from '@fhevm-sdk/universal';
import { JsonRpcProvider } from 'ethers';

async function main() {
  console.log('🚀 Starting FHEVM Node.js Example');
  console.log('=====================================\n');

  try {
    // Initialize FHEVM with a public RPC endpoint
    const rpcUrl = 'https://eth-mainnet.g.alchemy.com/v2/demo'; // Using Alchemy demo endpoint
    const fhevm = createFHEVM('ethers');
    
    console.log('📡 Connecting to Ethereum network...');
    
    // Create provider
    const provider = new JsonRpcProvider(rpcUrl);
    
    // Initialize FHEVM
    await fhevm.initialize({
      chainId: 1, // Mainnet
      provider: provider,
    });
    
    console.log('✅ FHEVM initialized successfully!');
    console.log(`🔑 Public Key: ${await fhevm.getPublicKey()}\n`);

    // Example 1: Encrypt a string
    console.log('🔒 Example 1: Encrypting a string');
    const secretMessage = 'This is a confidential message from Node.js!';
    console.log(`Original message: "${secretMessage}"`);
    
    const encrypted = await fhevm.encrypt(secretMessage);
    console.log('Encrypted data:', JSON.stringify(encrypted, null, 2));
    console.log('');

    // Example 2: Decrypt the encrypted data
    console.log('🔓 Example 2: Decrypting the data');
    const decrypted = await fhevm.decrypt(encrypted);
    console.log('Decryption result:', decrypted);
    console.log('');

    // Example 3: Encrypt a number
    console.log('🔢 Example 3: Encrypting a number');
    const secretNumber = 42;
    console.log(`Original number: ${secretNumber}`);
    
    const encryptedNumber = await fhevm.encrypt(secretNumber);
    console.log('Encrypted number:', JSON.stringify(encryptedNumber, null, 2));
    
    const decryptedNumber = await fhevm.decrypt(encryptedNumber);
    console.log('Decrypted number:', decryptedNumber);
    console.log('');

    // Example 4: Encrypt a boolean
    console.log('✅ Example 4: Encrypting a boolean');
    const secretBoolean = true;
    console.log(`Original boolean: ${secretBoolean}`);
    
    const encryptedBoolean = await fhevm.encrypt(secretBoolean);
    console.log('Encrypted boolean:', JSON.stringify(encryptedBoolean, null, 2));
    
    const decryptedBoolean = await fhevm.decrypt(encryptedBoolean);
    console.log('Decrypted boolean:', decryptedBoolean);
    console.log('');

    // Example 5: Batch encryption
    console.log('📦 Example 5: Batch encryption');
    const batchData = [
      'First secret',
      123,
      false,
      'Another secret',
      456
    ];
    
    console.log('Batch data:', batchData);
    
    const encryptedBatch = await Promise.all(
      batchData.map(item => fhevm.encrypt(item))
    );
    
    console.log('Encrypted batch:');
    encryptedBatch.forEach((encrypted, index) => {
      console.log(`  [${index}]:`, JSON.stringify(encrypted, null, 2));
    });
    
    const decryptedBatch = await Promise.all(
      encryptedBatch.map(encrypted => fhevm.decrypt(encrypted))
    );
    
    console.log('Decrypted batch:', decryptedBatch.map(result => result.value));
    console.log('');

    // Example 6: Error handling
    console.log('⚠️ Example 6: Error handling');
    try {
      const invalidEncrypted = {
        data: 'invalid_data',
        signature: 'invalid_signature'
      };
      
      const result = await fhevm.decrypt(invalidEncrypted);
      console.log('Invalid decryption result:', result);
    } catch (error) {
      console.log('Caught expected error:', error.message);
    }
    console.log('');

    console.log('🎉 All examples completed successfully!');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error occurred:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the main function
main().catch(console.error);
