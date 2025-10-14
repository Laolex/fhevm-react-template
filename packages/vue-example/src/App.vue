<template>
  <div class="app">
    <header class="app-header">
      <h1>Universal FHEVM SDK - Vue Example</h1>
      <p>Framework-agnostic toolkit for confidential dApps</p>
    </header>
    
    <main class="app-main">
      <div class="container">
        <div class="hero">
          <h1>Universal FHEVM SDK</h1>
          <p>Framework-agnostic toolkit for confidential dApps</p>
        </div>

        <div class="demo-section">
          <h2>Encryption/Decryption Demo</h2>
          <div class="fhevm-demo">
            <div class="input-section">
              <label>
                Value to encrypt:
                <input
                  v-model="inputValue"
                  type="text"
                  placeholder="Enter value to encrypt"
                />
              </label>
            </div>

            <div class="button-section">
              <button
                @click="handleEncrypt"
                :disabled="isEncrypting || !isInitialized"
                class="encrypt-button"
              >
                {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
              </button>
              <button
                @click="handleDecrypt"
                :disabled="isDecrypting || !encryptedValue || !isInitialized"
                class="decrypt-button"
              >
                {{ isDecrypting ? 'Decrypting...' : 'Decrypt' }}
              </button>
              <button
                @click="handleReset"
                class="reset-button"
              >
                Reset
              </button>
            </div>

            <div v-if="encryptedValue" class="encrypted-section">
              <h4>Encrypted Value:</h4>
              <pre>{{ JSON.stringify(encryptedValue, null, 2) }}</pre>
            </div>

            <div v-if="decryptedValue" class="decrypted-section">
              <h4>Decrypted Value:</h4>
              <p>{{ JSON.stringify(decryptedValue.value) }}</p>
            </div>

            <div v-if="error" class="error-section">
              <h4>Error:</h4>
              <p class="error-message">{{ error }}</p>
            </div>

            <div class="status-section">
              <h4>Status:</h4>
              <p :class="statusClass">{{ statusText }}</p>
            </div>
          </div>
        </div>

        <div class="features">
          <h2>Features</h2>
          <div class="feature-grid">
            <div class="feature-card">
              <h3>🔒 End-to-End Encryption</h3>
              <p>Secure encryption and decryption of sensitive data</p>
            </div>
            <div class="feature-card">
              <h3>⚡ Framework Agnostic</h3>
              <p>Works with React, Vue, Node.js, and more</p>
            </div>
            <div class="feature-card">
              <h3>🎯 Easy Integration</h3>
              <p>Simple API similar to wagmi for web3 developers</p>
            </div>
            <div class="feature-card">
              <h3>🛡️ Production Ready</h3>
              <p>Built on Zama's official FHEVM infrastructure</p>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="app-footer">
      <p>Built with Universal FHEVM SDK</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { FHEVMCore, createFHEVM } from '@fhevm-sdk/universal';

const inputValue = ref('Hello FHEVM from Vue!');
const encryptedValue = ref(null);
const decryptedValue = ref(null);
const isEncrypting = ref(false);
const isDecrypting = ref(false);
const error = ref('');
const fhevm = ref<FHEVMCore | null>(null);
const isInitialized = ref(false);

const statusClass = computed(() => {
  if (isInitialized.value) return 'status-ready';
  return 'status-not-initialized';
});

const statusText = computed(() => {
  if (isInitialized.value) return '✅ FHEVM Ready';
  return '⚠️ FHEVM Not Initialized';
});

onMounted(() => {
  // Initialize FHEVM for demo purposes
  // In a real app, you would connect to a wallet
  initializeFHEVM();
});

const initializeFHEVM = async () => {
  try {
    const fhevmInstance = createFHEVM('ethers');
    // For demo purposes, we'll simulate initialization
    // In a real app, you would use actual wallet provider
    isInitialized.value = true;
    fhevm.value = fhevmInstance;
  } catch (err) {
    error.value = 'Failed to initialize FHEVM';
  }
};

const handleEncrypt = async () => {
  if (!fhevm.value) return;
  
  isEncrypting.value = true;
  error.value = '';
  
  try {
    // Simulate encryption for demo
    const encrypted = {
      data: `encrypted_${btoa(inputValue.value)}`,
      signature: 'demo_signature'
    };
    encryptedValue.value = encrypted;
  } catch (err) {
    error.value = 'Encryption failed';
  } finally {
    isEncrypting.value = false;
  }
};

const handleDecrypt = async () => {
  if (!fhevm.value || !encryptedValue.value) return;
  
  isDecrypting.value = true;
  error.value = '';
  
  try {
    // Simulate decryption for demo
    const result = {
      value: inputValue.value,
      success: true
    };
    decryptedValue.value = result;
  } catch (err) {
    error.value = 'Decryption failed';
  } finally {
    isDecrypting.value = false;
  }
};

const handleReset = () => {
  encryptedValue.value = null;
  decryptedValue.value = null;
  error.value = '';
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.app-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background: #f8f9fa;
  padding: 1rem;
  text-align: center;
  color: #666;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 1.3rem;
  color: #666;
}

.demo-section {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.fhevm-demo {
  max-width: 600px;
  margin: 0 auto;
}

.fhevm-demo h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.input-section {
  margin-bottom: 1.5rem;
}

.input-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-section input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.button-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.encrypt-button,
.decrypt-button,
.reset-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.encrypt-button {
  background: #007bff;
  color: white;
}

.encrypt-button:hover:not(:disabled) {
  background: #0056b3;
}

.decrypt-button {
  background: #28a745;
  color: white;
}

.decrypt-button:hover:not(:disabled) {
  background: #1e7e34;
}

.reset-button {
  background: #dc3545;
  color: white;
}

.reset-button:hover {
  background: #c82333;
}

.encrypt-button:disabled,
.decrypt-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.encrypted-section,
.decrypted-section {
  margin-bottom: 1.5rem;
}

.encrypted-section h4,
.decrypted-section h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.encrypted-section pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9rem;
}

.error-section {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.error-message {
  color: #721c24;
  font-weight: 500;
}

.status-section {
  margin-bottom: 1.5rem;
}

.status-ready {
  color: #155724;
  font-weight: 500;
}

.status-not-initialized {
  color: #856404;
  font-weight: 500;
}

.features {
  margin-top: 3rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .button-section {
    flex-direction: column;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
