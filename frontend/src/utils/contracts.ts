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
}

// Get contract instances with signer
export function getContractInstancesWithSigner(signer: ethers.Signer, chainId: number): ContractInstances {
  const addresses = getContractAddresses(chainId)
  
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
  
  return { ageVerifier, proofRegistry }
}

// Submit proof to blockchain
export async function submitProofToBlockchain(
  signer: ethers.Signer,
  chainId: number,
  zkProof: ZKProof
): Promise<ethers.ContractTransactionResponse> {
  console.log('🚀 Submitting proof to blockchain...')
  
  const { proofRegistry } = getContractInstancesWithSigner(signer, chainId)
  
  // Format proof for contract
  const formattedProof = formatProofForContract(zkProof)
  const formattedPublicSignals = formatPublicSignalsForContract(zkProof)
  
  console.log('📝 Formatted proof:', formattedProof)
  console.log('📊 Public signals:', formattedPublicSignals)
  
  // Submit proof to contract
  const tx = await proofRegistry.verifyAndStoreProof(formattedProof, formattedPublicSignals)
  console.log('✅ Transaction submitted:', tx.hash)
  
  return tx
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