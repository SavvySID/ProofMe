// Custom hook for wallet and contract interactions
import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useAccount, useNetwork } from 'wagmi'
import { 
  getContractInstancesWithSigner,
  checkVerificationStatus,
  submitProofToBlockchain,
  waitForTransaction,
  VerificationStatus
} from '../utils/contracts'
import { generateZKProof, ZKProof } from '../utils/zkProof'
import { transactionTracker } from '../utils/transactionTracker'
import { TransactionStatus } from '../types/global'

export interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
}

export interface ContractState {
  ageVerifier: ethers.Contract | null
  proofRegistry: ethers.Contract | null
}

export function useWallet() {
  // Use wagmi hooks for wallet state
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    provider: null,
    signer: null
  })

  const [contractState, setContractState] = useState<ContractState>({
    ageVerifier: null,
    proofRegistry: null
  })

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    verified: false,
    timestamp: 0
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTransaction, setCurrentTransaction] = useState<TransactionStatus | null>(null)

  // Update wallet state when wagmi state changes
  useEffect(() => {
    const updateWalletState = async () => {
      if (isConnected && address && chain && typeof window.ethereum !== 'undefined') {
        try {
          // Create provider and signer from the connected wallet
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          
          setWalletState({
            isConnected: true,
            address,
            chainId: chain.id,
            provider,
            signer
          })

          // Get contract instances
          try {
            const contracts = getContractInstancesWithSigner(signer, chain.id)
            setContractState(contracts)
            
            // Check verification status
            if (contracts.proofRegistry) {
              try {
                const status = await checkVerificationStatus(provider, chain.id, address)
                setVerificationStatus(status)
              } catch (statusError) {
                console.error('Error checking verification status:', statusError)
              }
            }
          } catch (contractError) {
            console.error('Failed to get contract instances:', contractError)
            setContractState({ ageVerifier: null, proofRegistry: null })
          }
        } catch (err) {
          console.error('Error setting up wallet state:', err)
          setError('Failed to connect to wallet')
        }
      } else {
        // Reset wallet state when disconnected
        setWalletState({
          isConnected: false,
          address: null,
          chainId: null,
          provider: null,
          signer: null
        })
        setContractState({
          ageVerifier: null,
          proofRegistry: null
        })
        setVerificationStatus({
          verified: false,
          timestamp: 0
        })
        setCurrentTransaction(null)
        setError(null)
      }
    }

    updateWalletState()
  }, [isConnected, address, chain])

  // Poll for transaction status updates
  useEffect(() => {
    if (!currentTransaction) return

    const interval = setInterval(() => {
      const updatedStatus = transactionTracker.getTransactionStatus(currentTransaction.hash)
      if (updatedStatus && updatedStatus.status !== currentTransaction.status) {
        setCurrentTransaction(updatedStatus)
        
        // If transaction is confirmed, check verification status
        if (updatedStatus.status === 'confirmed') {
          checkStatus()
        }
      }
    }, 2000) // Check every 2 seconds

    return () => clearInterval(interval)
  }, [currentTransaction])

  // Generate and submit proof
  const generateAndSubmitProof = useCallback(async (birthYear: number): Promise<ZKProof | null> => {
    if (!walletState.signer || !walletState.chainId) {
      setError('Wallet not connected')
      return null
    }

    // Check if contracts are deployed on current network using deploymentChecker
    const { deploymentChecker } = await import('../utils/deploymentChecker')
    try {
      console.log('🔍 Checking contract deployment for chain:', walletState.chainId)
      const deploymentStatus = await deploymentChecker.checkDeployment(walletState.chainId)
      console.log('🔍 Deployment status:', deploymentStatus)
      
      if (!deploymentStatus.overall) {
        console.error('❌ Contracts not deployed on current network')
        setError(`Contracts not deployed on current network (Chain ID: ${walletState.chainId}). Please switch to a network with deployed contracts.`)
        return null
      }
      console.log('✅ Contracts are deployed, proceeding with proof submission')
    } catch (error) {
      console.error('❌ Error checking contract deployment:', error)
      setError(`Failed to verify contract deployment. Please check your network connection.`)
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Generate ZK proof locally first
      const currentYear = new Date().getFullYear()
      const zkProof = await generateZKProof({ birthYear, currentYear })

      // Check if we have contract instances
      if (!contractState.proofRegistry) {
        throw new Error('ProofRegistry contract not available. Please ensure you are connected to the correct network.')
      }

      // Submit proof to blockchain
      console.log('🚀 About to submit proof to blockchain...')
      const tx = await submitProofToBlockchain(walletState.signer, walletState.chainId, zkProof)
      console.log('✅ Proof submitted successfully, transaction hash:', tx.hash)
      
      // Start tracking the transaction
      console.log('📊 Starting transaction tracking...')
      transactionTracker.addTransaction(tx.hash, walletState.chainId)
      const initialStatus = transactionTracker.getTransactionStatus(tx.hash)
      setCurrentTransaction(initialStatus || null)
      
      // Wait for transaction confirmation
      console.log('⏳ Waiting for transaction confirmation...')
      const receipt = await waitForTransaction(walletState.provider!, tx.hash)
      console.log('✅ Transaction confirmed, receipt:', receipt)
      
      // Check for verification events
      const events = receipt.logs
        .map(log => {
          try {
            return contractState.proofRegistry?.interface.parseLog(log)
          } catch {
            return null
          }
        })
        .filter(event => event && (event.name === 'ProofVerified' || event.name === 'ProofVerificationFailed'))

      if (events.length > 0) {
        const event = events[0]
        if (event?.name === 'ProofVerified') {
          // Update verification status
          const status = await checkVerificationStatus(walletState.provider!, walletState.chainId, walletState.address!)
          setVerificationStatus(status)
        } else if (event?.name === 'ProofVerificationFailed') {
          throw new Error('Proof verification failed on blockchain')
        }
      }

      return zkProof

    } catch (err) {
      console.error('Error generating and submitting proof:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate and submit proof')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [walletState, contractState])

  // Check verification status
  const checkStatus = useCallback(async () => {
    if (!walletState.provider || !walletState.chainId || !walletState.address) {
      return
    }

    try {
      const status = await checkVerificationStatus(walletState.provider, walletState.chainId, walletState.address)
      setVerificationStatus(status)
    } catch (err) {
      console.error('Error checking verification status:', err)
    }
  }, [walletState])

  // Get transaction explorer URL
  const getTransactionExplorerUrl = useCallback((hash: string) => {
    if (!walletState.chainId) return ''
    return transactionTracker.getExplorerUrl(hash, walletState.chainId)
  }, [walletState.chainId])

  return {
    walletState,
    contractState,
    verificationStatus,
    isLoading,
    error,
    currentTransaction,
    generateAndSubmitProof,
    checkStatus,
    getTransactionExplorerUrl
  }
} 