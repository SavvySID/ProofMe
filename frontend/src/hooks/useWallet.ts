// Custom hook for wallet and contract interactions
import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { 
  getContractInstancesWithSigner,
  checkVerificationStatus,
  submitProofToBlockchain,
  waitForTransaction,
  VerificationStatus
} from '../utils/contracts'
import { generateZKProof, ZKProof } from '../utils/zkProof'

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

// Citrea testnet configuration
const CITREA_TESTNET = {
  chainId: '0x13fb', // 5115 in hex
  chainName: 'Citrea Testnet',
  nativeCurrency: {
    name: 'cBTC',
    symbol: 'cBTC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.citrea.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.citrea.xyz'],
}

export function useWallet() {
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
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Switch to Citrea testnet
  const switchToCitreaTestnet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    setIsSwitchingNetwork(true)
    setError(null)

    try {
      console.log('Requesting network switch to Citrea testnet...')
      
      // First, try to switch to the existing chain
      try {
        await window.ethereum.request({
          method: 'wallet_switchChain',
          params: [{ chainId: CITREA_TESTNET.chainId }],
        })
        console.log('User switched to Citrea testnet')
      } catch (switchError: any) {
        console.log('Switch failed, error code:', switchError.code)
        
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          console.log('Chain not found, showing add network popup...')
          // Just show the add network popup, let user handle it
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CITREA_TESTNET],
          })
          console.log('Add network popup shown to user')
        } else if (switchError.code === 4001) {
          console.log('User rejected the network switch')
          // User rejected, that's fine - just log it
        } else {
          console.log('Other switch error:', switchError.message)
          // For any other error, just show the add network popup
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CITREA_TESTNET],
          })
        }
      }
    } catch (error: any) {
      console.log('Network operation completed or cancelled by user')
      // Don't throw errors for user cancellations or completed operations
      if (error.code === 4001) {
        console.log('User cancelled the operation')
      }
    } finally {
      setIsSwitchingNetwork(false)
    }
  }, [])

  // Initialize wallet connection
  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask and try again.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.')
      }

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)

      console.log('Connected to network with chainId:', chainId)

      // Check if we're on the correct network and contracts are deployed
      if (chainId !== 5115 && chainId !== 1337) {
        console.log('Connected to unsupported network (Chain ID:', chainId, ')')
        // Just show a warning, don't automatically switch
        setError(`Connected to unsupported network (Chain ID: ${chainId}). Please switch to Citrea Testnet (Chain ID: 5115) or Localhost (Chain ID: 1337) in MetaMask.`)
      } else if (chainId === 5115) {
        // Check if contracts are deployed on Citrea testnet
        const { areContractsDeployed } = await import('../config/contracts')
        if (!areContractsDeployed(chainId)) {
          console.log('Contracts not deployed on Citrea testnet')
          setError(`Contracts are not yet deployed to Citrea Testnet. Please switch to Localhost (Chain ID: 1337) for testing, or contact support if you need Citrea testnet deployment.`)
        }
      }

      // Get contract instances (this might fail if contracts aren't deployed on current network)
      let contracts
      try {
        contracts = getContractInstancesWithSigner(signer, chainId)
      } catch (contractError) {
        console.error('Failed to get contract instances:', contractError)
        // Continue without contracts for now
        contracts = { ageVerifier: null, proofRegistry: null }
      }

      setWalletState({
        isConnected: true,
        address,
        chainId,
        provider,
        signer
      })

      setContractState(contracts)

      // Check verification status (only if contracts are available)
      if (contracts.proofRegistry) {
        try {
          const status = await checkVerificationStatus(provider, chainId, address)
          setVerificationStatus(status)
        } catch (statusError) {
          console.error('Error checking verification status:', statusError)
          // Don't fail the connection if status check fails
        }
      }

    } catch (err) {
      console.error('Error connecting wallet:', err)
      let errorMessage = 'Failed to connect wallet'
      
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          errorMessage = 'Connection was rejected. Please try again and approve the connection in MetaMask.'
        } else if (err.message.includes('No accounts found')) {
          errorMessage = 'No accounts found. Please unlock MetaMask and try again.'
        } else if (err.message.includes('MetaMask is not installed')) {
          errorMessage = 'MetaMask is not installed. Please install MetaMask and try again.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [switchToCitreaTestnet])

  // Disconnect wallet - opens MetaMask for manual disconnect
  const disconnectWallet = useCallback(async () => {
    console.log('Opening MetaMask for disconnect...')
    
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Open MetaMask by requesting current accounts - this opens the extension
        await window.ethereum.request({ 
          method: 'eth_accounts' 
        })
        
        // Show user a message about how to disconnect
        setTimeout(() => {
          alert('To disconnect:\n1. Click on the MetaMask extension icon\n2. Click on the three dots menu\n3. Go to "Connected sites"\n4. Find this site and click "Disconnect"')
        }, 500)
        
        console.log('MetaMask opened. User can manually disconnect.')
      } catch (error) {
        console.error('Error opening MetaMask:', error)
        
        // Fallback: just clear app state
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
        setError(null)
        setIsLoading(false)
        setIsSwitchingNetwork(false)
        
        console.log('App disconnected (MetaMask connection may persist)')
      }
    } else {
      alert('MetaMask not detected')
    }
  }, [])

  // Generate and submit proof
  const generateAndSubmitProof = useCallback(async (birthYear: number): Promise<ZKProof | null> => {
    if (!walletState.signer || !walletState.chainId) {
      setError('Wallet not connected')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Generate ZK proof
      const currentYear = new Date().getFullYear()
      const zkProof = await generateZKProof({ birthYear, currentYear })

      // Submit proof to blockchain
      const tx = await submitProofToBlockchain(walletState.signer, walletState.chainId, zkProof)
      
      // Wait for transaction confirmation
      const receipt = await waitForTransaction(walletState.provider!, tx.hash)
      
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

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') {
      return
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Clear app state when MetaMask disconnects
        console.log('MetaMask disconnected, clearing app state...')
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
        setError(null)
        setIsLoading(false)
        setIsSwitchingNetwork(false)
      } else {
        // Reconnect with new account
        connectWallet()
      }
    }

    const handleChainChanged = () => {
      // Reload page on chain change
      window.location.reload()
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [connectWallet, disconnectWallet])

  // Check if already connected on mount (but don't auto-connect)
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            // User is already connected, initialize the connection
            console.log('Existing connection detected, initializing...')
            await connectWallet()
          }
        } catch (error) {
          console.log('No existing connection found')
        }
      }
    }
    
    checkExistingConnection()
  }, [connectWallet])

  return {
    walletState,
    contractState,
    verificationStatus,
    isLoading,
    isSwitchingNetwork,
    error,
    connectWallet,
    disconnectWallet,
    generateAndSubmitProof,
    checkStatus,
    switchToCitreaTestnet
  }
} 