#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

async function main() {
  console.log('🔄 Syncing deployment file with frontend config...')
  console.log('==================================================\n')

  try {
    // Read the current frontend contracts config
    const contractsConfigPath = path.join(__dirname, '../frontend/src/config/contracts.ts')
    const contractsConfig = fs.readFileSync(contractsConfigPath, 'utf8')
    
    // Extract Citrea contract addresses using regex
    const citreaMatch = contractsConfig.match(/citrea:\s*{[^}]*AgeVerifier:\s*"([^"]*)"[^}]*ProofRegistry:\s*"([^"]*)"[^}]*}/s)
    
    if (!citreaMatch) {
      console.error('❌ Could not find Citrea contract addresses in frontend config')
      process.exit(1)
    }
    
    const ageVerifierAddress = citreaMatch[1]
    const proofRegistryAddress = citreaMatch[2]
    
    console.log('📋 Frontend config addresses:')
    console.log(`   AgeVerifier: ${ageVerifierAddress}`)
    console.log(`   ProofRegistry: ${proofRegistryAddress}`)
    
    // Read the current deployment file
    const deploymentPath = path.join(__dirname, '../deployment-citrea.json')
    let deploymentInfo = {}
    
    if (fs.existsSync(deploymentPath)) {
      deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'))
      console.log('\n📋 Current deployment file addresses:')
      console.log(`   AgeVerifier: ${deploymentInfo.contracts?.AgeVerifier || 'Not found'}`)
      console.log(`   ProofRegistry: ${deploymentInfo.contracts?.ProofRegistry || 'Not found'}`)
    } else {
      console.log('\n📋 No deployment file found, will create new one')
    }
    
    // Update deployment info with current addresses
    const updatedDeploymentInfo = {
      network: 'Citrea Testnet',
      chainId: 5115,
      contracts: {
        AgeVerifier: ageVerifierAddress,
        ProofRegistry: proofRegistryAddress
      },
      deployer: deploymentInfo.deployer || 'Unknown',
      timestamp: new Date().toISOString(),
      rpcUrl: 'https://rpc.testnet.citrea.xyz',
      explorer: 'https://explorer.testnet.citrea.xyz',
      note: 'Addresses synced from frontend config'
    }
    
    // Write updated deployment file
    fs.writeFileSync(deploymentPath, JSON.stringify(updatedDeploymentInfo, null, 2))
    console.log('\n✅ Deployment file updated successfully!')
    console.log(`📁 File saved to: ${deploymentPath}`)
    
    // Check if addresses changed
    if (deploymentInfo.contracts) {
      const ageVerifierChanged = deploymentInfo.contracts.AgeVerifier !== ageVerifierAddress
      const proofRegistryChanged = deploymentInfo.contracts.ProofRegistry !== proofRegistryAddress
      
      if (ageVerifierChanged || proofRegistryChanged) {
        console.log('\n⚠️  Address changes detected:')
        if (ageVerifierChanged) {
          console.log(`   AgeVerifier: ${deploymentInfo.contracts.AgeVerifier} → ${ageVerifierAddress}`)
        }
        if (proofRegistryChanged) {
          console.log(`   ProofRegistry: ${deploymentInfo.contracts.ProofRegistry} → ${proofRegistryAddress}`)
        }
        console.log('\n🔄 Frontend will now use the updated addresses')
      } else {
        console.log('\n✅ Addresses are already in sync')
      }
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
