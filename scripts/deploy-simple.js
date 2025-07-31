#!/usr/bin/env node

const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying ProofMe contracts...');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);

  // Deploy AgeVerifier first
  console.log('\n📄 Deploying AgeVerifier...');
  const AgeVerifier = await ethers.getContractFactory('AgeVerifier');
  const ageVerifier = await AgeVerifier.deploy();
  await ageVerifier.waitForDeployment();
  const ageVerifierAddress = await ageVerifier.getAddress();
  console.log('✅ AgeVerifier deployed to:', ageVerifierAddress);

  // Deploy ProofRegistry
  console.log('\n📄 Deploying ProofRegistry...');
  const ProofRegistry = await ethers.getContractFactory('ProofRegistry');
  const proofRegistry = await ProofRegistry.deploy(ageVerifierAddress);
  await proofRegistry.waitForDeployment();
  const proofRegistryAddress = await proofRegistry.getAddress();
  console.log('✅ ProofRegistry deployed to:', proofRegistryAddress);

  // Save deployment addresses
  const deploymentInfo = {
    ageVerifier: ageVerifierAddress,
    proofRegistry: proofRegistryAddress,
    network: 'citrea',
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('\n📄 Deployment addresses saved to deployment.json');

  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📋 Contract Addresses:');
  console.log('AgeVerifier:', ageVerifierAddress);
  console.log('ProofRegistry:', proofRegistryAddress);
  
  console.log('\n💡 Next steps:');
  console.log('1. Update your .env file with these addresses');
  console.log('2. Start the frontend: npm run dev');
  console.log('3. Visit http://localhost:3000');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }); 