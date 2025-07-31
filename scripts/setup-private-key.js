#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

console.log('🔑 Private Key Setup for ProofMe');
console.log('=================================\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file...');
  const envContent = `# Citrea Testnet Configuration
CITREA_RPC_URL=https://rpc.testnet.citrea.xyz
PRIVATE_KEY=your_private_key_here

# Frontend Configuration (update after deployment)
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_CITREA_RPC=https://rpc.testnet.citrea.xyz
VITE_CHAIN_ID=5115`;
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file exists');
}

// Read current .env content
const envContent = fs.readFileSync('.env', 'utf8');

// Check if private key is properly set
const privateKeyMatch = envContent.match(/PRIVATE_KEY=(.+)/);
const hasValidPrivateKey = privateKeyMatch && 
                          privateKeyMatch[1] !== 'your_private_key_here' && 
                          privateKeyMatch[1].length === 64 &&
                          /^[0-9a-fA-F]+$/.test(privateKeyMatch[1]);

if (!hasValidPrivateKey) {
  console.log('\n⚠️  Private key is not properly configured!');
  console.log('\n📋 You need to:');
  console.log('1. Get your private key from your wallet (MetaMask, etc.)');
  console.log('2. Update the .env file with your actual private key');
  console.log('3. Make sure it\'s 64 characters long (32 bytes)');
  
  console.log('\n💡 How to get your private key:');
  console.log('- Open MetaMask');
  console.log('- Go to Account Details');
  console.log('- Click "Export Private Key"');
  console.log('- Enter your password');
  console.log('- Copy the private key (starts with 0x)');
  console.log('- Remove the "0x" prefix');
  
  console.log('\n🔧 Example of correct format:');
  console.log('PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
  
  console.log('\n⚠️  IMPORTANT:');
  console.log('- Never share your private key');
  console.log('- Never commit it to version control');
  console.log('- Use a test wallet for development');
  
  console.log('\n🎯 After updating your .env file, try:');
  console.log('npm run deploy:citrea');
  
} else {
  console.log('\n✅ Private key is properly configured!');
  console.log('🎯 You can now deploy: npm run deploy:citrea');
}

console.log('\n📚 For testing, you can also:');
console.log('1. Use a local network: npm run deploy:local');
console.log('2. Get test cBTC from: https://citrea.xyz/faucet'); 