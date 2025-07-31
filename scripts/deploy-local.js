#!/usr/bin/env node

const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying ProofMe contracts to local Hardhat network...');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);
  
  // Get balance using ethers v6 syntax
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), "ETH");

  try {
    // Deploy AgeVerifier first
    console.log('\n📋 Deploying AgeVerifier...');
    const AgeVerifier = await ethers.getContractFactory('AgeVerifier');
    const ageVerifier = await AgeVerifier.deploy();
    await ageVerifier.waitForDeployment();
    const ageVerifierAddress = await ageVerifier.getAddress();
    console.log('✅ AgeVerifier deployed to:', ageVerifierAddress);

    // Deploy ProofRegistry with AgeVerifier address
    console.log('\n📋 Deploying ProofRegistry...');
    const ProofRegistry = await ethers.getContractFactory('ProofRegistry');
    const proofRegistry = await ProofRegistry.deploy(ageVerifierAddress);
    await proofRegistry.waitForDeployment();
    const proofRegistryAddress = await proofRegistry.getAddress();
    console.log('✅ ProofRegistry deployed to:', proofRegistryAddress);

    // Get network info
    const network = await ethers.provider.getNetwork();

    // Log deployment summary
    console.log('\n🎉 Local Deployment Summary:');
    console.log('==============================');
    console.log('AgeVerifier:', ageVerifierAddress);
    console.log('ProofRegistry:', proofRegistryAddress);
    console.log('Network: Local Hardhat');
    console.log('Chain ID:', network.chainId);
    console.log('==============================');

    // Save deployment addresses to file
    const deploymentInfo = {
      network: 'localhost',
      chainId: Number(network.chainId),
      contracts: {
        AgeVerifier: ageVerifierAddress,
        ProofRegistry: proofRegistryAddress
      },
      deployer: deployer.address,
      timestamp: new Date().toISOString()
    };

    const fs = require('fs');
    fs.writeFileSync(
      'deployment-local.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log('💾 Local deployment info saved to deployment-local.json');

    console.log('\n🎯 Next steps:');
    console.log('1. Update your .env file with these local addresses');
    console.log('2. Start the frontend: npm run dev');
    console.log('3. Test the proof generation and verification flow');
    console.log('4. For Citrea deployment, get cBTC from: https://citrea.xyz/faucet');

  } catch (error) {
    console.error('❌ Local deployment failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 