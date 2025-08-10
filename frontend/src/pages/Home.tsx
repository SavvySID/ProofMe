import React from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import logoImage from '../assets/ProofMe.png'

const Home: React.FC = () => {
  const { walletState, verificationStatus, isLoading, isSwitchingNetwork, error, connectWallet, switchToCitreaTestnet } = useWallet()

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
      console.log('Switching to Citrea testnet from Home component...')
      await switchToCitreaTestnet()
      // The page will reload automatically after successful switch
    } catch (err) {
      console.error('Failed to switch network:', err)
      // Show error message to user
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      alert(`Failed to switch to Citrea testnet: ${errorMessage}\n\nPlease switch to Citrea Testnet (Chain ID: 5115) manually in MetaMask.`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center py-16">
            <div className="flex justify-center items-center mb-6">
              <img 
                src={logoImage} 
                alt="ProofMe Logo" 
                className="h-16 w-16 mr-4"
              />
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                ProofMe
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Privacy-first age verification powered by zero-knowledge proofs on Bitcoin
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {walletState.isConnected ? (
                <Link
                  to="/proof"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {verificationStatus.verified ? 'View Proof Status' : 'Start Verification'}
                </Link>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isLoading}
                  className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet to Start'}
                </button>
              )}
              <a
                href="#how-it-works"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-all duration-200"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Wallet Status */}
          {walletState.isConnected && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-12 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connected Wallet
              </h3>
              <p className="text-gray-600 font-mono mb-2">
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
                    ✅ Age Verified
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Verified on {new Date(verificationStatus.timestamp * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-red-700 mb-2">{error}</p>
              {error.includes('unsupported network') && (
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

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Zero-Knowledge Proofs
              </h3>
              <p className="text-gray-600">
                Prove your age without revealing your actual birth date or any personal information.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bitcoin Native
              </h3>
              <p className="text-gray-600">
                Built on Citrea zkEVM, leveraging Bitcoin's security and decentralization.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Reusable Proofs
              </h3>
              <p className="text-gray-600">
                Generate once, use anywhere. Your proof is valid across all supported platforms.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div id="how-it-works" className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Users</h3>
                <ol className="space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
                    Connect your wallet to ProofMe
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
                    Enter your birth year (never stored)
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
                    Generate a zero-knowledge proof
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</span>
                    Submit proof to blockchain for verification
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Verifiers</h3>
                <ol className="space-y-4 text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
                    Check user's wallet address on blockchain
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
                    Verify the zero-knowledge proof
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
                    Confirm age requirement is met
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</span>
                    Grant access without collecting personal data
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 