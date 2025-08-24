import { ethers } from 'ethers'
import { CONTRACTS, NETWORKS } from '../config/contracts'

export interface DeploymentStatus {
  network: string
  chainId: number
  contracts: {
    AgeVerifier: {
      address: string
      deployed: boolean
      code: string | null
    }
    ProofRegistry: {
      address: string
      deployed: boolean
      code: string | null
    }
  }
  overall: boolean
  message: string
  timestamp: number
}

export class DeploymentChecker {
  private static instance: DeploymentChecker
  private cache: Map<number, DeploymentStatus> = new Map()
  private cacheTimeout = 30000 // 30 seconds

  static getInstance(): DeploymentChecker {
    if (!DeploymentChecker.instance) {
      DeploymentChecker.instance = new DeploymentChecker()
    }
    return DeploymentChecker.instance
  }

  // Check deployment status for a specific network
  async checkDeployment(chainId: number): Promise<DeploymentStatus> {
    console.log(`🔍 Checking deployment for chain ${chainId}`)
    
    // Check cache first
    const cached = this.cache.get(chainId)
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log(`📋 Using cached result for chain ${chainId}: ${cached.overall ? '✅ Deployed' : '❌ Not Deployed'}`)
      return cached
    }

    const network = NETWORKS[chainId as keyof typeof NETWORKS]
    if (!network) {
      console.log(`❌ Unsupported network: ${chainId}`)
      const status: DeploymentStatus = {
        network: `Chain ID: ${chainId}`,
        chainId,
        contracts: {
          AgeVerifier: { address: '0x0', deployed: false, code: null },
          ProofRegistry: { address: '0x0', deployed: false, code: null }
        },
        overall: false,
        message: 'Unsupported network',
        timestamp: Date.now()
      }
      this.cache.set(chainId, status)
      return status
    }

    console.log(`🌐 Checking network: ${network.name} (${network.rpcUrl})`)

    try {
      const provider = await this.getProvider(chainId)
      if (!provider) {
        throw new Error('Failed to get provider')
      }

      const contracts = CONTRACTS[this.getNetworkKey(chainId) as keyof typeof CONTRACTS] || {
        AgeVerifier: '0x0000000000000000000000000000000000000000',
        ProofRegistry: '0x0000000000000000000000000000000000000000'
      }

      console.log(`📋 Contracts to check:`, contracts)

      // Check AgeVerifier contract
      const ageVerifierStatus = await this.checkContract(provider, contracts.AgeVerifier)
      
      // Check ProofRegistry contract
      const proofRegistryStatus = await this.checkContract(provider, contracts.ProofRegistry)

      const overall = ageVerifierStatus.deployed && proofRegistryStatus.deployed
      
      console.log(`📊 Overall deployment status: ${overall ? '✅ All Deployed' : '❌ Not All Deployed'}`)
      
      const status: DeploymentStatus = {
        network: network.name,
        chainId,
        contracts: {
          AgeVerifier: ageVerifierStatus,
          ProofRegistry: proofRegistryStatus
        },
        overall,
        message: overall 
          ? `Contracts deployed on ${network.name}`
          : `Contracts not fully deployed on ${network.name}`,
        timestamp: Date.now()
      }

      this.cache.set(chainId, status)
      return status

    } catch (error) {
      console.error(`Error checking deployment for chain ${chainId}:`, error)
      
      const status: DeploymentStatus = {
        network: network?.name || `Chain ID: ${chainId}`,
        chainId,
        contracts: {
          AgeVerifier: { address: '0x0', deployed: false, code: null },
          ProofRegistry: { address: '0x0', deployed: false, code: null }
        },
        overall: false,
        message: `Error checking deployment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      }
      
      this.cache.set(chainId, status)
      return status
    }
  }

  // Check if a specific contract is deployed
  private async checkContract(provider: ethers.Provider, address: string): Promise<{
    address: string
    deployed: boolean
    code: string | null
  }> {
    if (address === '0x0000000000000000000000000000000000000000') {
      return {
        address,
        deployed: false,
        code: null
      }
    }

    try {
      console.log(`🔍 Checking contract at address: ${address}`)
      const code = await provider.getCode(address)
      const deployed = code !== '0x'
      console.log(`📋 Contract ${address}: ${deployed ? '✅ Deployed' : '❌ Not Deployed'} (code length: ${code.length})`)
      
      return {
        address,
        deployed,
        code: code === '0x' ? null : code
      }
    } catch (error) {
      console.error(`Error checking contract ${address}:`, error)
      return {
        address,
        deployed: false,
        code: null
      }
    }
  }

  // Get provider for the given chain
  private async getProvider(chainId: number): Promise<ethers.Provider | null> {
    try {
      // Always use direct RPC provider for deployment checking
      const network = NETWORKS[chainId as keyof typeof NETWORKS]
      if (!network) {
        console.error(`Unsupported network ${chainId}`)
        return null
      }
      
      const provider = new ethers.JsonRpcProvider(network.rpcUrl)
      console.log(`🔌 Created RPC provider for ${network.rpcUrl}`)
      
      return provider
    } catch (error) {
      console.error(`Error getting provider for chain ${chainId}:`, error)
      return null
    }
  }

  // Get network key from chain ID
  private getNetworkKey(chainId: number): string {
    switch (chainId) {
      case 1337:
        return 'localhost'
      case 5115:
        return 'citrea'
      default:
        return 'localhost'
    }
  }

  // Clear cache
  clearCache(): void {
    console.log(`🗑️ Clearing cache for all networks`)
    this.cache.clear()
  }

  // Clear cache for specific network
  clearCacheForNetwork(chainId: number): void {
    console.log(`🗑️ Clearing cache for network ${chainId}`)
    this.cache.delete(chainId)
  }

  // Force refresh deployment status for a specific network
  async forceRefresh(chainId: number): Promise<DeploymentStatus> {
    console.log(`🔄 Force refreshing deployment status for chain ${chainId}`)
    this.cache.delete(chainId)
    return this.checkDeployment(chainId)
  }

  // Get cached status
  getCachedStatus(chainId: number): DeploymentStatus | undefined {
    return this.cache.get(chainId)
  }

  // Debug method: Check contracts directly using RPC
  async debugCheckContracts(chainId: number): Promise<void> {
    console.log(`🔍 Debug: Checking contracts for chain ${chainId}`)
    
    const network = NETWORKS[chainId as keyof typeof NETWORKS]
    if (!network) {
      console.log(`❌ Debug: Unsupported network ${chainId}`)
      return
    }

    console.log(`🌐 Debug: Network config:`, network)
    
    const contracts = CONTRACTS[this.getNetworkKey(chainId) as keyof typeof CONTRACTS]
    console.log(`📋 Debug: Contract addresses:`, contracts)

    try {
      // Create a direct provider
      const provider = new ethers.JsonRpcProvider(network.rpcUrl)
      console.log(`🔌 Debug: Provider created for ${network.rpcUrl}`)
      
      // Check each contract
      for (const [name, address] of Object.entries(contracts)) {
        try {
          const code = await provider.getCode(address)
          const deployed = code !== '0x'
          console.log(`🔍 Debug: ${name} at ${address}: ${deployed ? '✅ Deployed' : '❌ Not Deployed'} (code length: ${code.length})`)
          
          if (deployed) {
            console.log(`📄 ${name} code preview: ${code.substring(0, 100)}...`)
          } else {
            console.log(`❌ Contract ${name} at ${address} has no code (0x)`)
          }
        } catch (error) {
          console.error(`❌ Debug: Error checking ${name}:`, error)
        }
      }
    } catch (error) {
      console.error(`❌ Debug: Error creating provider:`, error)
    }
  }

  // Manual verification method
  async manualVerifyContracts(chainId: number): Promise<boolean> {
    console.log(`🔍 Manual verification for chain ${chainId}`)
    
    try {
      const status = await this.checkDeployment(chainId)
      console.log(`📊 Manual verification result:`, status)
      
      if (status.overall) {
        console.log(`✅ Manual verification: All contracts are deployed!`)
        return true
      } else {
        console.log(`❌ Manual verification: Some contracts are not deployed`)
        console.log(`📋 Contract details:`, status.contracts)
        return false
      }
    } catch (error) {
      console.error(`❌ Manual verification failed:`, error)
      return false
    }
  }

  // Verify current config addresses match deployed contracts
  async verifyAddressesMatch(chainId: number): Promise<void> {
    console.log(`🔍 Verifying address configuration for chain ${chainId}`)
    
    const network = NETWORKS[chainId as keyof typeof NETWORKS]
    if (!network) {
      console.log(`❌ Unsupported network: ${chainId}`)
      return
    }

    const contracts = CONTRACTS[this.getNetworkKey(chainId) as keyof typeof CONTRACTS]
    console.log(`📋 Current config addresses:`, contracts)

    try {
      const provider = new ethers.JsonRpcProvider(network.rpcUrl)
      
      for (const [name, address] of Object.entries(contracts)) {
        try {
          const code = await provider.getCode(address)
          const deployed = code !== '0x'
          console.log(`🔍 ${name}: ${deployed ? '✅ Deployed' : '❌ Not Deployed'} at ${address}`)
          
          if (!deployed) {
            console.log(`⚠️  WARNING: ${name} at ${address} has no code!`)
            console.log(`   This address may be incorrect or the contract may not be deployed.`)
          } else {
            console.log(`📄 Contract code length: ${code.length}`)
            
                         // Try to create a contract instance to check the interface
             try {
               const { CONTRACTS: CONTRACT_CONFIG, PROOF_REGISTRY_ABI } = await import('../config/contracts')
               const contract = new ethers.Contract(address, PROOF_REGISTRY_ABI, provider)
               
               // Safely check interface functions
               if (contract.interface) {
                 const functions = Object.keys(contract.interface.fragments)
                 console.log(`📋 Available functions for ${name}:`, functions)
                 
                 // Check for critical functions
                 const hasVerifier = functions.includes('verifier')
                 const hasVerifyAndStoreProof = functions.includes('verifyAndStoreProof')
                 
                 console.log(`🔍 Function check: verifier() ${hasVerifier ? '✅' : '❌'}, verifyAndStoreProof() ${hasVerifyAndStoreProof ? '✅' : '❌'}`)
                 
                 if (!hasVerifier || !hasVerifyAndStoreProof) {
                   console.log(`⚠️  WARNING: Contract at ${address} is missing expected functions!`)
                   console.log(`   This may not be the correct ProofMe contract.`)
                 }
               } else {
                 console.log(`⚠️  Contract interface not available for ${name}`)
               }
             } catch (contractError) {
               console.log(`⚠️  Could not verify contract interface:`, contractError)
             }
          }
        } catch (error) {
          console.error(`❌ Error checking ${name}:`, error)
        }
      }
    } catch (error) {
      console.error(`❌ Error creating provider:`, error)
    }
  }

  // Direct RPC verification method (bypasses MetaMask completely)
  async verifyWithRPC(chainId: number): Promise<DeploymentStatus> {
    console.log(`🔍 Direct RPC verification for chain ${chainId}`)
    
    const network = NETWORKS[chainId as keyof typeof NETWORKS]
    if (!network) {
      throw new Error(`Unsupported network ${chainId}`)
    }

    try {
      // Create direct RPC provider
      const provider = new ethers.JsonRpcProvider(network.rpcUrl)
      console.log(`🔌 Direct RPC provider created for ${network.rpcUrl}`)
      
      const contracts = CONTRACTS[this.getNetworkKey(chainId) as keyof typeof CONTRACTS] || {
        AgeVerifier: '0x0000000000000000000000000000000000000000',
        ProofRegistry: '0x0000000000000000000000000000000000000000'
      }

      console.log(`📋 Checking contracts via RPC:`, contracts)

      // Check each contract directly
      const ageVerifierStatus = await this.checkContract(provider, contracts.AgeVerifier)
      const proofRegistryStatus = await this.checkContract(provider, contracts.ProofRegistry)

      const overall = ageVerifierStatus.deployed && proofRegistryStatus.deployed
      
      console.log(`📊 RPC verification result: ${overall ? '✅ All Deployed' : '❌ Not All Deployed'}`)
      
      const status: DeploymentStatus = {
        network: network.name,
        chainId,
        contracts: {
          AgeVerifier: ageVerifierStatus,
          ProofRegistry: proofRegistryStatus
        },
        overall,
        message: overall 
          ? `Contracts deployed on ${network.name} (RPC verified)`
          : `Contracts not fully deployed on ${network.name} (RPC verified)`,
        timestamp: Date.now()
      }

      // Update cache with RPC result
      this.cache.set(chainId, status)
      return status

    } catch (error) {
      console.error(`RPC verification failed for chain ${chainId}:`, error)
      throw error
    }
  }
}

export const deploymentChecker = DeploymentChecker.getInstance()
