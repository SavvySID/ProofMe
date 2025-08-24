#!/usr/bin/env node

const { ethers } = require('hardhat')
require('dotenv').config()

async function main() {
  console.log('🔍 Verifying ProofMe contracts on Citrea Testnet...')
  console.log('==================================================\n')

  try {
    // Setup provider
    const provider = new ethers.JsonRpcProvider(process.env.CITREA_RPC_URL || 'https://rpc.citrea.xyz')
    
    // Contract addresses from deployment
    const ageVerifierAddress = '0x0CeA5A342406B25f1279e7D151546B225689b426'
    const proofRegistryAddress = '0x1dc707B376Ec306B92365443f366F3772B1c6Fb9'
    
    console.log('📡 Connected to Citrea Testnet')
    console.log(`🔍 Checking contract: ${ageVerifierAddress}`)
    console.log(`🔍 Checking contract: ${proofRegistryAddress}`)
    
    // Check AgeVerifier contract
    const ageVerifierCode = await provider.getCode(ageVerifierAddress)
    const ageVerifierDeployed = ageVerifierCode !== '0x'
    
    // Check ProofRegistry contract
    const proofRegistryCode = await provider.getCode(proofRegistryAddress)
    const proofRegistryDeployed = proofRegistryCode !== '0x'
    
    console.log('\n📊 Deployment Status:')
    console.log('=====================')
    console.log(`AgeVerifier: ${ageVerifierDeployed ? '✅ Deployed' : '❌ Not Deployed'}`)
    console.log(`ProofRegistry: ${proofRegistryDeployed ? '✅ Deployed' : '❌ Not Deployed'}`)
    
    if (ageVerifierDeployed && proofRegistryDeployed) {
      console.log('\n🎉 All contracts are deployed and ready!')
      console.log('You can now generate proofs with full blockchain functionality.')
      
      // Check contract details
      try {
        const ageVerifier = new ethers.Contract(ageVerifierAddress, ['function verifier() view returns (address)'], provider)
        const proofRegistry = new ethers.Contract(proofRegistryAddress, ['function verifier() view returns (address)'], provider)
        
        const verifierAddress = await proofRegistry.verifier()
        console.log(`\n🔗 Contract Links:`)
            console.log(`AgeVerifier: https://explorer.testnet.citrea.xyz/address/${ageVerifierAddress}`)
    console.log(`ProofRegistry: https://explorer.testnet.citrea.xyz/address/${proofRegistryAddress}`)
        console.log(`Verifier Reference: ${verifierAddress}`)
        
        if (verifierAddress.toLowerCase() === ageVerifierAddress.toLowerCase()) {
          console.log('✅ Contract references are correctly set up')
        } else {
          console.log('⚠️ Contract references may not be correctly configured')
        }
        
      } catch (error) {
        console.log('⚠️ Could not verify contract references:', error.message)
      }
      
    } else {
      console.log('\n❌ Some contracts are not deployed')
      console.log('Please check the deployment process and try again.')
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
