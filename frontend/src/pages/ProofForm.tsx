import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { ZKProof } from '../utils/zkProof'

const ProofForm: React.FC = () => {
  const navigate = useNavigate()
  const {
    walletState,
    verificationStatus,
    isLoading,
    isSwitchingNetwork,
    error,
    connectWallet,
    generateAndSubmitProof,
    switchToCitreaTestnet
  } = useWallet()

  const [birthYear, setBirthYear] = useState('')
  const [proof, setProof] = useState<ZKProof | null>(null)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!walletState.isConnected) {
      setLocalError('Please connect your wallet first')
      return
    }

    if (!birthYear || birthYear.length !== 4) {
      setLocalError('Please enter a valid 4-digit birth year')
      return
    }

    const currentYear = new Date().getFullYear()
    const age = currentYear - parseInt(birthYear)
    
    if (age < 18) {
      setLocalError('You must be at least 18 years old to use this service')
      return
    }

    setLocalError('')

    try {
      // Generate and submit proof
      const zkProof = await generateAndSubmitProof(parseInt(birthYear))
      
      if (zkProof) {
        setProof(zkProof)
        
        // Navigate to status page with proof data
        navigate('/status', { 
          state: { 
            proof: zkProof,
            birthYear,
            timestamp: new Date().toISOString(),
            verified: true
          } 
        })
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to generate proof')
    }
  }

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 5115:
        return 'Citrea Testnet'
      case 1337:
        return 'Localhost'
      default:
        return 'Unknown Network'
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      console.log('Switching to Citrea testnet from ProofForm component...')
      await switchToCitreaTestnet()
      // The page will reload automatically after successful switch
    } catch (err) {
      console.error('Failed to switch network:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setLocalError(`Failed to switch to Citrea testnet: ${errorMessage}. Please switch to Citrea Testnet (Chain ID: 5115) manually in MetaMask.`)
    }
  }

  if (!walletState.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                You need to connect your wallet to verify your age.
              </p>
              <button 
                onClick={connectWallet}
                disabled={isLoading}
                className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Age Verification</h2>
              <p className="text-gray-600">
                Prove you are over 18 without revealing your exact birth date.
              </p>
            </div>

            {/* Wallet Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Connected Wallet</h3>
              <p className="text-blue-700 font-mono text-sm">
                {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
              </p>
              
              {/* Network Info */}
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  walletState.chainId === 5115 
                    ? 'bg-green-100 text-green-800' 
                    : walletState.chainId === 1337
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getNetworkName(walletState.chainId)}
                </span>
                
                {/* Show switch network button if not on Citrea testnet */}
                {walletState.chainId !== 5115 && walletState.chainId !== 1337 && (
                  <button
                    onClick={handleSwitchNetwork}
                    disabled={isSwitchingNetwork}
                    className={`ml-2 text-xs text-blue-600 hover:text-blue-800 underline ${
                      isSwitchingNetwork ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSwitchingNetwork ? 'Switching...' : 'Switch to Citrea Testnet'}
                  </button>
                )}
              </div>

              {verificationStatus.verified && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ Already Verified
                  </span>
                  <p className="text-xs text-blue-600 mt-1">
                    Verified on {new Date(verificationStatus.timestamp * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Year
                </label>
                <input
                  type="number"
                  id="birthYear"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="1990"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  This information is only used locally to generate your proof and is never stored.
                </p>
              </div>

              {(error || localError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 mb-2">{error || localError}</p>
                  {(error || localError)?.includes('unsupported network') && (
                    <div className="mt-2">
                      <p className="text-sm text-red-600 mb-2">
                        To use ProofMe, you need to be connected to one of these networks:
                      </p>
                      <ul className="text-sm text-red-600 list-disc list-inside mb-3">
                        <li>Citrea Testnet (Chain ID: 5115)</li>
                        <li>Localhost (Chain ID: 1337) - for local development</li>
                      </ul>
                      <button
                        onClick={handleSwitchNetwork}
                        disabled={isSwitchingNetwork}
                        className={`bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors ${
                          isSwitchingNetwork ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSwitchingNetwork ? 'Switching...' : 'Switch to Citrea Testnet'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || verificationStatus.verified}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  isLoading || verificationStatus.verified
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading 
                  ? 'Generating Proof...' 
                  : verificationStatus.verified 
                    ? 'Already Verified' 
                    : 'Generate Age Proof'
                }
              </button>
            </form>

            {/* Pending Status - Show while generating proof */}
            {isLoading && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⏳ Proof Pending Verification</h3>
                <p className="text-yellow-700 text-sm">
                  Your proof is being processed on the blockchain.
                </p>
                <div className="mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                    <span className="text-sm text-yellow-600">Generating and submitting proof...</span>
                  </div>
                </div>
              </div>
            )}

            {proof && !isLoading && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✅ Proof Generated!</h3>
                <p className="text-sm text-green-700">
                  Your age verification proof has been created successfully and submitted to the blockchain.
                </p>
              </div>
            )}

            {/* ZK Proof Info */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">How ZK Proofs Work</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Your birth year is used locally to generate a cryptographic proof</p>
                <p>• The proof verifies you are over 18 without revealing your exact age</p>
                <p>• The proof is submitted to the blockchain for permanent verification</p>
                <p>• No personal data is ever stored on-chain</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProofForm 