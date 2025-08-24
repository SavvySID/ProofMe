#!/usr/bin/env node

const { ethers } = require('hardhat')
const fs = require('fs')
const path = require('path')

async function main() {
  console.log('🚀 Deploying ProofMe contracts to Citrea Testnet...')
  console.log('==================================================\n')

  // Check if we have the required environment variables
  const requiredEnvVars = ['PRIVATE_KEY', 'CITREA_RPC_URL']
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`))
    console.error('\nPlease create a .env file with:')
    console.error('PRIVATE_KEY=your_private_key_here')
    console.error('CITREA_RPC_URL=https://rpc.citrea.xyz')
    process.exit(1)
  }

  try {
    // Setup provider and signer for Citrea testnet
    const provider = new ethers.JsonRpcProvider(process.env.CITREA_RPC_URL)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    
    console.log('📡 Connected to Citrea Testnet')
    console.log(`👤 Deployer address: ${signer.address}`)
    
    // Check balance
    const balance = await provider.getBalance(signer.address)
    console.log(`💰 Balance: ${ethers.formatEther(balance)} tBTC`)
    
    if (balance < ethers.parseEther('0.001')) {
      console.error('❌ Insufficient balance. Please get some tBTC from the Citrea faucet.')
      console.error('   Faucet: https://faucet.citrea.xyz')
      process.exit(1)
    }

    // Deploy AgeVerifier contract
    console.log('\n🔧 Deploying AgeVerifier contract...')
    const AgeVerifier = await ethers.getContractFactory('AgeVerifier', signer)
    const ageVerifier = await AgeVerifier.deploy()
    await ageVerifier.waitForDeployment()
    const ageVerifierAddress = await ageVerifier.getAddress()
    console.log(`✅ AgeVerifier deployed to: ${ageVerifierAddress}`)

    // Deploy ProofRegistry contract
    console.log('\n🔧 Deploying ProofRegistry contract...')
    const ProofRegistry = await ethers.getContractFactory('ProofRegistry', signer)
    const proofRegistry = await ProofRegistry.deploy(ageVerifierAddress)
    await proofRegistry.waitForDeployment()
    const proofRegistryAddress = await proofRegistry.getAddress()
    console.log(`✅ ProofRegistry deployed to: ${proofRegistryAddress}`)

    // Verify contracts are deployed
    console.log('\n🔍 Verifying contract deployment...')
    const ageVerifierCode = await provider.getCode(ageVerifierAddress)
    const proofRegistryCode = await provider.getCode(proofRegistryAddress)
    
    if (ageVerifierCode === '0x' || proofRegistryCode === '0x') {
      throw new Error('Contract deployment verification failed')
    }
    
    console.log('✅ Both contracts verified as deployed')

    // Save deployment info
    const deploymentInfo = {
      network: 'Citrea Testnet',
      chainId: 5115,
      contracts: {
        AgeVerifier: ageVerifierAddress,
        ProofRegistry: proofRegistryAddress
      },
      deployer: signer.address,
      timestamp: new Date().toISOString(),
      rpcUrl: process.env.CITREA_RPC_URL,
      explorer: 'https://explorer.testnet.citrea.xyz'
    }

    const deploymentPath = path.join(__dirname, '../deployment-citrea.json')
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2))
    console.log(`\n💾 Deployment info saved to: ${deploymentPath}`)

    // Update frontend contracts configuration
    console.log('\n🔧 Updating frontend contracts configuration...')
    const contractsConfigPath = path.join(__dirname, '../frontend/src/config/contracts.ts')
    let contractsConfig = fs.readFileSync(contractsConfigPath, 'utf8')
    
    // Update Citrea contract addresses
    contractsConfig = contractsConfig.replace(
      /citrea:\s*{[^}]*AgeVerifier:\s*"[^"]*"[^}]*ProofRegistry:\s*"[^"]*"[^}]*}/s,
      `citrea: {
    AgeVerifier: "${ageVerifierAddress}",
    ProofRegistry: "${proofRegistryAddress}"
  }`
    )
    
    fs.writeFileSync(contractsConfigPath, contractsConfig)
    console.log('✅ Frontend contracts configuration updated')

    // Display next steps
    console.log('\n🎉 Deployment completed successfully!')
    console.log('=====================================')
    console.log('\n📋 Next steps:')
    console.log('1. Update your frontend with the new contract addresses')
    console.log('2. Test the age verification flow on Citrea testnet')
    console.log('3. Monitor transactions on the explorer')
    console.log(`4. Explorer: https://explorer.testnet.citrea.xyz/address/${proofRegistryAddress}`)
    
    console.log('\n⚠️  Important notes:')
    console.log('- Keep your private key secure and never commit it to version control')
    console.log('- These contracts are deployed on testnet and may be reset')
    console.log('- Test thoroughly before deploying to mainnet')
    
    console.log('\n🔗 Useful links:')
    console.log('- Citrea Explorer: https://explorer.testnet.citrea.xyz')
    console.log('- Citrea RPC: https://rpc.citrea.xyz')
    console.log('- Citrea Faucet: https://faucet.citrea.xyz')

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message)
    console.error('\n🔍 Troubleshooting tips:')
    console.error('- Ensure you have sufficient tBTC balance')
    console.error('- Check your internet connection')
    console.error('- Verify the RPC URL is correct')
    console.error('- Make sure your private key is valid')
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error)
  process.exit(1)
})

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
