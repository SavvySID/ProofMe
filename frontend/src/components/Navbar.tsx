import React from 'react'
import { Link } from 'react-router-dom'
import SimpleWalletButton from './SimpleWalletButton'

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-citrea-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ProofMe</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-citrea-600 transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/verify" 
              className="text-gray-600 hover:text-citrea-600 transition-colors duration-200"
            >
              Verify Age
            </Link>
            <Link 
              to="/status" 
              className="text-gray-600 hover:text-citrea-600 transition-colors duration-200"
            >
              Check Status
            </Link>
          </div>

          {/* Wallet Connect */}
          <div className="flex items-center space-x-4">
            <SimpleWalletButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 