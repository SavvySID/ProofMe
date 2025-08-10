#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗑️  Undeploying ProofMe testnet contracts...');
console.log('============================================\n');

// Paths to files that need to be updated
const contractsConfigPath = path.join(__dirname, '../frontend/src/config/contracts.ts');
const backupPath = path.join(__dirname, '../frontend/src/config/contracts.ts.backup');

// Current testnet addresses that will be "undeployed"
const currentTestnetAddresses = {
  AgeVerifier: "0x8DbA35d53090F0AB75c8B85a7f69C6DBa632A93c",
  ProofRegistry: "0xf3D7345229fAB99bc99Dc9dE6BEAeCA559760512"
};

// Zero addresses to replace the deployed contracts
const zeroAddress = "0x0000000000000000000000000000000000000000";

try {
  // Read the current contracts configuration
  console.log('📖 Reading current contracts configuration...');
  const contractsConfig = fs.readFileSync(contractsConfigPath, 'utf8');
  
  // Create a backup of the current configuration
  console.log('💾 Creating backup of current configuration...');
  fs.writeFileSync(backupPath, contractsConfig);
  console.log(`✅ Backup created at: ${backupPath}`);
  
  // Replace the testnet addresses with zero addresses
  console.log('🔄 Replacing testnet addresses with zero addresses...');
  
  let updatedConfig = contractsConfig;
  
  // Replace AgeVerifier address
  updatedConfig = updatedConfig.replace(
    new RegExp(`AgeVerifier: "${currentTestnetAddresses.AgeVerifier}"`, 'g'),
    `AgeVerifier: "${zeroAddress}"`
  );
  
  // Replace ProofRegistry address
  updatedConfig = updatedConfig.replace(
    new RegExp(`ProofRegistry: "${currentTestnetAddresses.ProofRegistry}"`, 'g'),
    `ProofRegistry: "${zeroAddress}"`
  );
  
  // Write the updated configuration back to the file
  fs.writeFileSync(contractsConfigPath, updatedConfig);
  
  console.log('✅ Testnet contracts successfully "undeployed" from frontend configuration');
  console.log('\n📋 Changes made:');
  console.log(`   AgeVerifier: ${currentTestnetAddresses.AgeVerifier} → ${zeroAddress}`);
  console.log(`   ProofRegistry: ${currentTestnetAddresses.ProofRegistry} → ${zeroAddress}`);
  
  console.log('\n⚠️  Important Notes:');
  console.log('   - The actual contracts still exist on the Citrea testnet blockchain');
  console.log('   - This script only removes them from the frontend configuration');
  console.log('   - The frontend will now treat these contracts as "not deployed"');
  console.log('   - A backup of the original configuration was created');
  
  console.log('\n🔄 To restore the testnet deployment:');
  console.log(`   cp ${backupPath} ${contractsConfigPath}`);
  
  console.log('\n🎯 Next steps:');
  console.log('   1. The frontend will no longer connect to testnet contracts');
  console.log('   2. Users will see "contracts not deployed" message');
  console.log('   3. You can redeploy to testnet using: npm run deploy:citrea');
  console.log('   4. Or use local network: npm run deploy:local');

} catch (error) {
  console.error('❌ Failed to undeploy testnet contracts:', error.message);
  process.exit(1);
}

