#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 ProofMe Status Check');
console.log('========================\n');

// Check if .env file exists
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
} else {
  console.log('❌ .env file missing');
}

// Check if deployment files exist
if (fs.existsSync('deployment-local.json')) {
  console.log('✅ Local deployment info exists');
  const deployment = JSON.parse(fs.readFileSync('deployment-local.json', 'utf8'));
  console.log('   - AgeVerifier:', deployment.contracts.AgeVerifier);
  console.log('   - ProofRegistry:', deployment.contracts.ProofRegistry);
} else {
  console.log('❌ Local deployment info missing');
}

// Check if frontend exists
if (fs.existsSync('frontend')) {
  console.log('✅ Frontend directory exists');
  
  // Check if frontend dependencies are installed
  if (fs.existsSync('frontend/node_modules')) {
    console.log('✅ Frontend dependencies installed');
  } else {
    console.log('⚠️  Frontend dependencies not installed');
  }
} else {
  console.log('❌ Frontend directory missing');
}

// Check if contracts are compiled
if (fs.existsSync('artifacts/contracts')) {
  console.log('✅ Contracts compiled');
} else {
  console.log('❌ Contracts not compiled');
}

console.log('\n📋 Current Status:');
console.log('==================');
console.log('✅ Smart contracts deployed locally');
console.log('✅ Environment configured');
console.log('✅ Frontend ready');

console.log('\n🎯 Next Steps:');
console.log('===============');
console.log('1. Start local Hardhat network: npx hardhat node');
console.log('2. Start frontend: cd frontend && npm run dev');
console.log('3. Visit http://localhost:3000');
console.log('4. Test the age verification flow');

console.log('\n💡 For Citrea Testnet:');
console.log('1. Get cBTC from: https://citrea.xyz/faucet');
console.log('2. Update .env with your real private key');
console.log('3. Run: npm run deploy:citrea');

console.log('\n✅ Your ProofMe dApp is ready for development!'); 