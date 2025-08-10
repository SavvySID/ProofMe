import React from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import NetworkStatus from './NetworkStatus'
import logoImage from '../assets/ProofMe.png'

const Navbar: React.FC = () => {
  const { walletState, isLoading, connectWallet, disconnectWallet } = useWallet()

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                src={logoImage} 
                alt="ProofMe Logo" 
                className="h-8 w-8 rounded-lg"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">ProofMe</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/proof"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Verify Age
                </Link>
                <Link
                  to="/status"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Proof Status
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {walletState.isConnected ? (
              <>
                {/* Network Status */}
                <NetworkStatus />
                
                {/* Wallet Address */}
                <span className="text-sm text-gray-600 font-mono">
                  {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
                </span>
                
                {/* Disconnect Button */}
                <button
                  onClick={disconnectWallet}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className={`bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 