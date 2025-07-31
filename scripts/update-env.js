#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Updating .env file with local deployment addresses...');

// Read deployment info
const deploymentInfo = JSON.parse(fs.readFileSync('deployment-local.json', 'utf8'));

// Create updated .env content
const envContent = `# Local Development Configuration
CITREA_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=b6800f5a21c4366032e1bad715c5d83138c7781a3add4d20b4ba82aecf8cc8bf

# Frontend Configuration (Local Deployment)
VITE_CONTRACT_ADDRESS=${deploymentInfo.contracts.ProofRegistry}
VITE_AGE_VERIFIER_ADDRESS=${deploymentInfo.contracts.AgeVerifier}
VITE_CITREA_RPC=http://127.0.0.1:8545
VITE_CHAIN_ID=${deploymentInfo.chainId}

# Network Configuration
NETWORK=localhost
CHAIN_ID=${deploymentInfo.chainId}
`;

fs.writeFileSync('.env', envContent);

console.log('✅ .env file updated with local deployment addresses!');
console.log('\n📋 Contract Addresses:');
console.log('AgeVerifier:', deploymentInfo.contracts.AgeVerifier);
console.log('ProofRegistry:', deploymentInfo.contracts.ProofRegistry);
console.log('Chain ID:', deploymentInfo.chainId);

console.log('\n🎯 Next steps:');
console.log('1. Start the frontend: npm run dev');
console.log('2. Visit http://localhost:3000');
console.log('3. Test the age verification flow');
console.log('4. For Citrea deployment, get cBTC from: https://citrea.xyz/faucet'); 