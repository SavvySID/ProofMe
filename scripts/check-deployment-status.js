#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking ProofMe deployment status...');
console.log('=====================================\n');

// Path to contracts configuration
const contractsConfigPath = path.join(__dirname, '../frontend/src/config/contracts.ts');

try {
  // Read the contracts configuration
  const contractsConfig = fs.readFileSync(contractsConfigPath, 'utf8');
  
  // Extract contract addresses using regex
  const localhostMatch = contractsConfig.match(/localhost:\s*{[^}]*AgeVerifier:\s*"([^"]+)"[^}]*ProofRegistry:\s*"([^"]+)"[^}]*}/s);
  const citreaMatch = contractsConfig.match(/citrea:\s*{[^}]*AgeVerifier:\s*"([^"]+)"[^}]*ProofRegistry:\s*"([^"]+)"[^}]*}/s);
  
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  
  console.log('🌐 Network Deployment Status:');
  console.log('==============================');
  
  // Localhost status
  if (localhostMatch) {
    const ageVerifier = localhostMatch[1];
    const proofRegistry = localhostMatch[2];
    const localDeployed = ageVerifier !== zeroAddress && proofRegistry !== zeroAddress;
    
    console.log(`🏠 Localhost (Chain ID: 1337):`);
    console.log(`   AgeVerifier: ${ageVerifier}`);
    console.log(`   ProofRegistry: ${proofRegistry}`);
    console.log(`   Status: ${localDeployed ? '✅ Deployed' : '❌ Not Deployed'}`);
  }
  
  console.log('');
  
  // Citrea testnet status
  if (citreaMatch) {
    const ageVerifier = citreaMatch[1];
    const proofRegistry = citreaMatch[2];
    const testnetDeployed = ageVerifier !== zeroAddress && proofRegistry !== zeroAddress;
    
    console.log(`🧪 Citrea Testnet (Chain ID: 5115):`);
    console.log(`   AgeVerifier: ${ageVerifier}`);
    console.log(`   ProofRegistry: ${proofRegistry}`);
    console.log(`   Status: ${testnetDeployed ? '✅ Deployed' : '❌ Not Deployed'}`);
  }
  
  console.log('\n📋 Summary:');
  console.log('===========');
  
  // Check if any network has deployed contracts
  const hasAnyDeployment = (localhostMatch && localhostMatch[1] !== zeroAddress && localhostMatch[2] !== zeroAddress) ||
                          (citreaMatch && citreaMatch[1] !== zeroAddress && citreaMatch[2] !== zeroAddress);
  
  if (hasAnyDeployment) {
    console.log('✅ At least one network has deployed contracts');
  } else {
    console.log('❌ No networks have deployed contracts');
  }
  
  console.log('\n🎯 Available Actions:');
  console.log('====================');
  console.log('• Deploy to localhost: npm run deploy:local');
  console.log('• Deploy to testnet: npm run deploy:citrea');
  console.log('• Undeploy testnet: npm run undeploy:testnet');
  console.log('• Check status: npm run status');
  
  // Check if backup exists
  const backupPath = path.join(__dirname, '../frontend/src/config/contracts.ts.backup');
  if (fs.existsSync(backupPath)) {
    console.log('\n💾 Backup Configuration:');
    console.log('========================');
    console.log('✅ Backup file exists at: contracts.ts.backup');
    console.log('🔄 To restore: cp contracts.ts.backup contracts.ts');
  }

} catch (error) {
  console.error('❌ Failed to check deployment status:', error.message);
  process.exit(1);
}

