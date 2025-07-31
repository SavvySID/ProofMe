#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Direct Deployment for ProofMe');
console.log('================================\n');

// Check if .env file exists and has required values
if (!fs.existsSync('.env')) {
  console.error('❌ .env file not found!');
  console.log('💡 Run: npm run deploy:check');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync('.env', 'utf8');
const hasPrivateKey = envContent.includes('PRIVATE_KEY=') && !envContent.includes('your_private_key_here');
const hasRpcUrl = envContent.includes('CITREA_RPC_URL=');

if (!hasPrivateKey) {
  console.log('⚠️  Please update your .env file with your private key:');
  console.log('   PRIVATE_KEY=your_actual_private_key_here');
  console.log('   (Remove the "your_private_key_here" placeholder)');
  process.exit(1);
}

if (!hasRpcUrl) {
  console.log('⚠️  Please add CITREA_RPC_URL to your .env file:');
  console.log('   CITREA_RPC_URL=https://rpc.testnet.citrea.xyz');
  process.exit(1);
}

console.log('✅ Environment configuration looks good');

// Try to deploy using direct hardhat command
console.log('\n🚀 Attempting deployment...');
try {
  execSync('node node_modules/hardhat/internal/cli/cli.js run scripts/deploy.js --network citrea', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('\n✅ Deployment completed successfully!');
} catch (error) {
  console.log('\n❌ Deployment failed. Trying alternative method...');
  
  // Try the simple deployment script
  try {
    execSync('node node_modules/hardhat/internal/cli/cli.js run scripts/deploy-simple.js --network citrea', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('\n✅ Deployment completed successfully!');
  } catch (simpleError) {
    console.log('\n❌ Both deployment methods failed.');
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure you have cBTC from faucet: https://citrea.xyz/faucet');
    console.log('2. Check your private key in .env file');
    console.log('3. Verify network connectivity');
    console.log('4. Try local deployment: npm run deploy:local');
    
    console.log('\n📋 Error details:');
    console.log('Main deployment error:', error.message);
    console.log('Simple deployment error:', simpleError.message);
  }
} 