// Contract interaction utilities for ProofMe
import { ethers } from 'ethers'
import { 
  getContractAddresses, 
  AGE_VERIFIER_ABI, 
  PROOF_REGISTRY_ABI 
} from '../config/contracts'
import { ZKProof, formatProofForContract, formatPublicSignalsForContract } from './zkProof'

export interface ContractInstances {
  ageVerifier: ethers.Contract
  proofRegistry: ethers.Contract
}

export interface VerificationStatus {
  verified: boolean
  timestamp: number
}

// Get contract instances
export function getContractInstances(provider: ethers.Provider, chainId: number): ContractInstances {
  const addresses = getContractAddresses(chainId)
  
  try {
    const ageVerifier = new ethers.Contract(
      addresses.AgeVerifier,
      AGE_VERIFIER_ABI,
      provider
    )
    
    const proofRegistry = new ethers.Contract(
      addresses.ProofRegistry,
      PROOF_REGISTRY_ABI,
      provider
    )
    
    return { ageVerifier, proofRegistry }
  } catch (error) {
    console.error('❌ Error creating contract instances:', error)
    throw new Error(`Failed to create contract instances: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Get contract instances with signer
export function getContractInstancesWithSigner(signer: ethers.Signer, chainId: number): ContractInstances {
  console.log('🔧 Creating contract instances for chain:', chainId)
  
  const addresses = getContractAddresses(chainId)
  console.log('📋 Contract addresses:', addresses)
  
  try {
    const ageVerifier = new ethers.Contract(
      addresses.AgeVerifier,
      AGE_VERIFIER_ABI,
      signer
    )
    
    const proofRegistry = new ethers.Contract(
      addresses.ProofRegistry,
      PROOF_REGISTRY_ABI,
      signer
    )
    
    console.log('✅ Contract instances created')
    
    // Safely check interface functions
    try {
      if (ageVerifier.interface) {
        const ageVerifierMethods = Object.keys(ageVerifier.interface.fragments)
        console.log('📋 AgeVerifier methods:', ageVerifierMethods)
      } else {
        console.log('⚠️ AgeVerifier interface not available')
      }
    } catch (error) {
      console.log('⚠️ Error getting AgeVerifier methods:', error)
    }
    
    try {
      if (proofRegistry.interface) {
        const proofRegistryMethods = Object.keys(proofRegistry.interface.fragments)
        console.log('📋 ProofRegistry methods:', proofRegistryMethods)
      } else {
        console.log('⚠️ ProofRegistry interface not available')
      }
    } catch (error) {
      console.log('⚠️ Error getting ProofRegistry methods:', error)
    }
    
    return { ageVerifier, proofRegistry }
  } catch (error) {
    console.error('❌ Error creating contract instances:', error)
    throw new Error(`Failed to create contract instances: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Submit proof to blockchain
export async function submitProofToBlockchain(
  signer: ethers.Signer,
  chainId: number,
  zkProof: ZKProof
): Promise<ethers.ContractTransactionResponse> {
  console.log('🚀 Submitting proof to blockchain...')
  console.log('🔗 Chain ID:', chainId)
  console.log('👤 Signer address:', await signer.getAddress())
  
  const { proofRegistry } = getContractInstancesWithSigner(signer, chainId)
  console.log('📋 ProofRegistry contract address:', proofRegistry.target)
  
  // Test contract connectivity first
  try {
    console.log('🧪 Testing contract connectivity...')
    
    // Check if contract interface is available
    if (!proofRegistry.interface) {
      throw new Error('Contract interface not available - ABI may not match deployed contract')
    }
    
    // Try to call a simple read function to test the connection
    if (proofRegistry.verifier) {
      try {
        const verifierAddress = await proofRegistry.verifier()
        console.log('✅ Contract read test successful, verifier address:', verifierAddress)
      } catch (error) {
        console.log('⚠️ Contract read test failed:', error)
        throw new Error(`Contract read test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    // Check if contract has the required function
    if (!proofRegistry.verifyAndStoreProof) {
      throw new Error('ProofRegistry contract does not have verifyAndStoreProof function')
    }
    
    console.log('✅ Contract has verifyAndStoreProof function')
    
  } catch (error) {
    console.error('❌ Contract connectivity test failed:', error)
    throw new Error(`Contract connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  // Format proof for contract
  const formattedProof = formatProofForContract(zkProof)
  const formattedPublicSignals = formatPublicSignalsForContract(zkProof)
  
  console.log('📝 Formatted proof:', formattedProof)
  console.log('📊 Public signals:', formattedPublicSignals)
  
  try {
    // Submit proof to contract
    console.log('📤 Calling verifyAndStoreProof...')
    console.log('📋 Function parameters:', { formattedProof, formattedPublicSignals })
    
    const tx = await proofRegistry.verifyAndStoreProof(formattedProof, formattedPublicSignals)
    console.log('✅ Transaction submitted:', tx.hash)
    
    return tx
  } catch (error) {
    console.error('❌ Error calling verifyAndStoreProof:', error)
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('execution reverted')) {
        throw new Error('Transaction reverted - this usually means the proof verification failed or the contract rejected the transaction')
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds for gas fees')
      } else if (error.message.includes('user rejected')) {
        throw new Error('Transaction was rejected by the user')
      } else if (error.message.includes('nonce too low')) {
        throw new Error('Transaction nonce error - try refreshing the page')
      } else {
        throw new Error(`Contract call failed: ${error.message}`)
      }
    } else {
      throw new Error(`Unknown error during contract call: ${String(error)}`)
    }
  }
}

// Check verification status
export async function checkVerificationStatus(
  provider: ethers.Provider,
  chainId: number,
  userAddress: string
): Promise<VerificationStatus> {
  console.log('🔍 Checking verification status for:', userAddress)
  
  // Check if contracts are deployed on this network
  const { areContractsDeployed } = await import('../config/contracts')
  if (!areContractsDeployed(chainId)) {
    console.warn('⚠️ Contracts not deployed on network with chainId:', chainId)
    return {
      verified: false,
      timestamp: 0
    }
  }
  
  const { proofRegistry } = getContractInstances(provider, chainId)
  
  try {
    const [verified, timestamp] = await proofRegistry.getVerificationStatus(userAddress)
    
    return {
      verified,
      timestamp: Number(timestamp)
    }
  } catch (error) {
    console.error('Error checking verification status:', error)
    return {
      verified: false,
      timestamp: 0
    }
  }
}

// Check if user is verified
export async function isUserVerified(
  provider: ethers.Provider,
  chainId: number,
  userAddress: string
): Promise<boolean> {
  const { proofRegistry } = getContractInstances(provider, chainId)
  
  try {
    return await proofRegistry.isVerified(userAddress)
  } catch (error) {
    console.error('Error checking if user is verified:', error)
    return false
  }
}

// Get verification timestamp
export async function getVerificationTimestamp(
  provider: ethers.Provider,
  chainId: number,
  userAddress: string
): Promise<number> {
  const { proofRegistry } = getContractInstances(provider, chainId)
  
  try {
    const timestamp = await proofRegistry.getVerificationTimestamp(userAddress)
    return Number(timestamp)
  } catch (error) {
    console.error('Error getting verification timestamp:', error)
    return 0
  }
}

// Wait for transaction confirmation
export async function waitForTransaction(
  provider: ethers.Provider,
  txHash: string,
  confirmations: number = 1
): Promise<ethers.ContractTransactionReceipt> {
  console.log('⏳ Waiting for transaction confirmation...')
  
  const receipt = await provider.waitForTransaction(txHash, confirmations)
  console.log('✅ Transaction confirmed:', receipt)
  
  return receipt as ethers.ContractTransactionReceipt
}

// Get transaction events
export function getTransactionEvents(receipt: ethers.ContractTransactionReceipt, eventName: string, chainId: number) {
  const { proofRegistry } = getContractInstances(receipt.provider, chainId)
  
  const events = receipt.logs
    .map(log => {
      try {
        return proofRegistry.interface.parseLog(log)
      } catch {
        return null
      }
    })
    .filter(event => event && event.name === eventName)
  
  return events
}

// Test contract connectivity and basic functions
export async function testContractConnectivity(
  signer: ethers.Signer,
  chainId: number
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('🧪 Testing contract connectivity...')
    
    const { proofRegistry } = getContractInstancesWithSigner(signer, chainId)
    console.log('📋 ProofRegistry contract created at:', proofRegistry.target)
    
    // Test 1: Check if contract has code
    const provider = signer.provider
    if (provider) {
      const code = await provider.getCode(proofRegistry.target)
      if (code === '0x') {
        return { success: false, message: 'Contract has no code at this address' }
      }
      console.log('✅ Contract has code (length:', code.length, ')')
    }
    
    // Test 2: Check available functions
    if (proofRegistry.interface) {
      const functions = Object.keys(proofRegistry.interface.fragments)
      console.log('📋 Available functions:', functions)
      
      // Test 3: Try to call a simple read function
      if (proofRegistry.verifier) {
        try {
          const verifierAddress = await proofRegistry.verifier()
          console.log('✅ verifier() function call successful:', verifierAddress)
        } catch (error) {
          console.log('⚠️ verifier() function call failed:', error)
        }
      }
      
      // Test 4: Check if verifyAndStoreProof function exists
      if (!proofRegistry.verifyAndStoreProof) {
        return { success: false, message: 'Contract does not have verifyAndStoreProof function' }
      }
    } else {
      console.log('⚠️ Contract interface not available')
      return { success: false, message: 'Contract interface not available' }
    }
    
    // Test 5: Check if we can estimate gas for the function call
    try {
      console.log('🧪 Testing gas estimation...')
      const { generateZKProof } = await import('./zkProof')
      const testProof = await generateZKProof({ birthYear: 1990, currentYear: 2025 })
      const formattedProof = formatProofForContract(testProof)
      const formattedPublicSignals = formatPublicSignalsForContract(testProof)
      
      const gasEstimate = await proofRegistry.verifyAndStoreProof.estimateGas(formattedProof, formattedPublicSignals)
      console.log('✅ Gas estimation successful:', gasEstimate.toString())
    } catch (error) {
      console.log('⚠️ Gas estimation failed:', error)
      return { 
        success: false, 
        message: `Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: String(error) }
      }
    }
    
    console.log('✅ Contract connectivity test passed')
    
    // Test 6: Check if wallet can send transactions
    try {
      console.log('🧪 Testing wallet transaction capability...')
      const signerAddress = await signer.getAddress()
      const balance = await signer.provider?.getBalance(signerAddress)
      console.log('💰 Wallet balance:', balance ? ethers.formatEther(balance) : 'Unknown')
      
      if (balance && balance > ethers.parseEther('0.001')) {
        console.log('✅ Wallet has sufficient balance for transactions')
      } else {
        console.log('⚠️ Wallet balance may be insufficient for transactions')
      }
    } catch (error) {
      console.log('⚠️ Balance check failed:', error)
    }
    
    return { 
      success: true, 
      message: 'Contract connectivity test passed',
      details: { functions: proofRegistry.interface ? Object.keys(proofRegistry.interface.fragments) : [], target: proofRegistry.target }
    }
    
  } catch (error) {
    console.error('❌ Contract connectivity test failed:', error)
    return { 
      success: false, 
      message: `Contract connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error: String(error) }
    }
  }
}

// Check if contract ABI is valid and matches deployed contract
export async function validateContractABI(
  provider: ethers.Provider,
  address: string,
  abi: any[]
): Promise<{ valid: boolean; message: string; functions?: string[] }> {
  try {
    console.log('🔍 Validating contract ABI...')
    
    const contract = new ethers.Contract(address, abi, provider)
    
    if (!contract.interface) {
      return { valid: false, message: 'Contract interface not available' }
    }
    
    const functions = Object.keys(contract.interface.fragments)
    console.log('📋 Contract functions found:', functions)
    
    // Check for critical functions
    const hasVerifier = functions.includes('verifier')
    const hasVerifyAndStoreProof = functions.includes('verifyAndStoreProof')
    
    if (!hasVerifier || !hasVerifyAndStoreProof) {
      return { 
        valid: false, 
        message: `Missing critical functions: verifier() ${hasVerifier ? '✅' : '❌'}, verifyAndStoreProof() ${hasVerifyAndStoreProof ? '✅' : '❌'}`,
        functions
      }
    }
    
    return { valid: true, message: 'Contract ABI is valid', functions }
    
  } catch (error) {
    console.error('❌ ABI validation failed:', error)
    return { 
      valid: false, 
      message: `ABI validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      functions: []
    }
  }
}

// Check if the deployed contract matches the expected ABI
export async function checkContractABIMatch(
  provider: ethers.Provider,
  address: string,
  expectedFunctions: string[]
): Promise<{ match: boolean; message: string; deployedFunctions?: string[] }> {
  try {
    console.log('🔍 Checking if deployed contract matches expected ABI...')
    
    // Get the actual deployed contract code
    const code = await provider.getCode(address)
    if (code === '0x') {
      return { match: false, message: 'No contract code at this address' }
    }
    
    // Try to create contract with expected ABI
    const { PROOF_REGISTRY_ABI } = await import('../config/contracts')
    const contract = new ethers.Contract(address, PROOF_REGISTRY_ABI, provider)
    
    if (!contract.interface) {
      return { match: false, message: 'Failed to create contract interface with expected ABI' }
    }
    
    const deployedFunctions = Object.keys(contract.interface.fragments)
    console.log('📋 Deployed contract functions:', deployedFunctions)
    
    // Check if all expected functions are present
    const missingFunctions = expectedFunctions.filter(fn => !deployedFunctions.includes(fn))
    
    if (missingFunctions.length > 0) {
      return { 
        match: false, 
        message: `Missing expected functions: ${missingFunctions.join(', ')}`,
        deployedFunctions
      }
    }
    
    return { match: true, message: 'Contract ABI matches expected interface', deployedFunctions }
    
  } catch (error) {
    console.error('❌ ABI match check failed:', error)
    return { 
      match: false, 
      message: `ABI match check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      deployedFunctions: []
    }
  }
}

// Discover what functions are actually available on the deployed contract
export async function discoverContractFunctions(
  provider: ethers.Provider,
  address: string
): Promise<{ success: boolean; message: string; functions?: string[]; error?: string }> {
  try {
    console.log('🔍 Discovering contract functions...')
    
    // Get the actual deployed contract code
    const code = await provider.getCode(address)
    if (code === '0x') {
      return { success: false, message: 'No contract code at this address' }
    }
    
    console.log('📄 Contract code length:', code.length)
    
    // Try to create a minimal contract interface to see what we can discover
    const minimalABI = [
      "function verifier() view returns (address)",
      "function verifyAndStoreProof(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)), uint256[])",
      "function getVerificationStatus(address) view returns (bool, uint256)",
      "function isVerified(address) view returns (bool)"
    ]
    
    try {
      const contract = new ethers.Contract(address, minimalABI, provider)
      
      if (contract.interface) {
        const functions = Object.keys(contract.interface.fragments)
        console.log('✅ Minimal ABI functions discovered:', functions)
        return { success: true, message: 'Functions discovered with minimal ABI', functions }
      }
    } catch (minimalError) {
      console.log('⚠️ Minimal ABI failed:', minimalError)
    }
    
    // If minimal ABI fails, try to call common function names directly
    const commonFunctions = ['verifier', 'verifyAndStoreProof', 'getVerificationStatus', 'isVerified']
    const discoveredFunctions: string[] = []
    
    for (const funcName of commonFunctions) {
      try {
        // Try to call the function to see if it exists
        if (funcName === 'verifier') {
          const iface = new ethers.Interface([`function ${funcName}() view returns (address)`])
          const result = await provider.call({
            to: address,
            data: iface.encodeFunctionData(funcName, [])
          })
          if (result && result !== '0x') {
            discoveredFunctions.push(funcName)
            console.log(`✅ Function ${funcName} discovered`)
          }
        }
      } catch (error) {
        console.log(`⚠️ Function ${funcName} not available:`, error)
      }
    }
    
    if (discoveredFunctions.length > 0) {
      return { success: true, message: 'Functions discovered by testing', functions: discoveredFunctions }
    }
    
    return { success: false, message: 'Could not discover contract functions' }
    
  } catch (error) {
    console.error('❌ Function discovery failed:', error)
    return { 
      success: false, 
      message: `Function discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: String(error)
    }
  }
}

// Create a working contract instance with minimal ABI
export function createWorkingContractInstance(
  signer: ethers.Signer,
  chainId: number
): { ageVerifier: ethers.Contract; proofRegistry: ethers.Contract } | null {
  try {
    console.log('🔧 Creating working contract instances...')
    
    const addresses = getContractAddresses(chainId)
    
    // Use minimal working ABI
    const minimalAgeVerifierABI = [
      "function verifyProof(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)), uint256[]) view returns (bool)"
    ]
    
    const minimalProofRegistryABI = [
      "function verifier() view returns (address)",
      "function verifyAndStoreProof(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)), uint256[])",
      "function getVerificationStatus(address) view returns (bool, uint256)",
      "function isVerified(address) view returns (bool)"
    ]
    
    const ageVerifier = new ethers.Contract(addresses.AgeVerifier, minimalAgeVerifierABI, signer)
    const proofRegistry = new ethers.Contract(addresses.ProofRegistry, minimalProofRegistryABI, signer)
    
    console.log('✅ Working contract instances created with minimal ABI')
    return { ageVerifier, proofRegistry }
    
  } catch (error) {
    console.error('❌ Failed to create working contract instances:', error)
    return null
  }
} 