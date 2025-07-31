#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

console.log('🧪 Test Deployment Setup for ProofMe');
console.log('====================================\n');

// Generate a test private key for development
const testPrivateKey = crypto.randomBytes(32).toString('hex');

console.log('🔑 Generating test private key for development...');
console.log(`📝 Test Private Key: ${testPrivateKey}`);

// Update .env file with test private key
const envContent = `# Citrea Testnet Configuration
CITREA_RPC_URL=https://rpc.testnet.citrea.xyz
PRIVATE_KEY=${testPrivateKey}

# Frontend Configuration (update after deployment)
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_CITREA_RPC=https://rpc.testnet.citrea.xyz
VITE_CHAIN_ID=5115`;

fs.writeFileSync('.env', envContent);

console.log('✅ .env file updated with test private key');
console.log('\n⚠️  IMPORTANT: This is a TEST private key!');
console.log('- Do NOT use this for real funds');
console.log('- This is for development/testing only');
console.log('- For production, use your actual wallet private key');

console.log('\n🎯 You can now try deployment:');
console.log('npm run deploy:citrea');

console.log('\n💡 For real deployment:');
console.log('1. Get your actual private key from MetaMask');
console.log('2. Replace the test private key in .env file');
console.log('3. Get cBTC from faucet: https://citrea.xyz/faucet');

console.log('\n📚 Alternative: Use local network for testing');
console.log('npm run deploy:local'); 