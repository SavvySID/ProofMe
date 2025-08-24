import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount, useNetwork } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import NetworkStatus from './NetworkStatus'
import logoImage from '../assets/ProofMe.png'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-gradient-to-r from-slate-50/30 via-blue-50/30 to-indigo-50/30 backdrop-blur-md shadow-lg border-b border-white/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <img 
                src={logoImage} 
                alt="ProofMe Logo" 
                className="h-10 w-10 rounded-xl drop-shadow-md group-hover:drop-shadow-lg transition-all duration-300 transform group-hover:scale-105"
              />
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                ProofMe
              </span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-2">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/20 hover:shadow-sm ${
                    isActive('/') ? 'text-blue-600 bg-gradient-to-r from-blue-50/50 via-blue-100/30 to-blue-50/50 border border-blue-200/50 shadow-sm' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/proof"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/20 hover:shadow-sm ${
                    isActive('/proof') ? 'text-blue-600 bg-gradient-to-r from-blue-50/50 via-blue-100/30 to-blue-50/50 border border-blue-200/50 shadow-sm' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Verify Age
                </Link>
                <Link
                  to="/status"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/20 hover:shadow-sm ${
                    isActive('/status') ? 'text-blue-600 bg-gradient-to-r from-blue-50/50 via-blue-100/30 to-blue-50/50 border border-blue-200/50 shadow-sm' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Proof Status
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isConnected && (
              <>
                {/* Network Status Indicator */}
                <NetworkStatus />
                
                {/* Wallet Address */}
                <Badge variant="secondary" className="bg-gradient-to-r from-slate-50/50 via-blue-50/50 to-indigo-50/50 text-gray-700 border-white/30 px-3 py-1 rounded-lg backdrop-blur-sm font-mono text-sm">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Badge>
                
                {/* Network Badge */}
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50 px-3 py-1">
                  {chain?.id === 5115 ? 'Citrea Testnet' : chain?.id === 1337 ? 'Localhost' : 'Unknown Network'}
                </Badge>
              </>
            )}
            
            {/* Connect/Disconnect Button */}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 