import React from 'react';
import logoImage from '../assets/ProofMe.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Company/Project Information */}
          <div className="text-center mb-6">
            {/* ProofMe Logo */}
            <div className="flex justify-center mb-3">
              <img 
                src={logoImage} 
                alt="ProofMe Logo" 
                className="h-10 w-10 rounded-lg"
              />
            </div>
            
            {/* Tagline */}
            <p className="text-base text-gray-300 mb-3 max-w-2xl mx-auto">
              Privacy-first age verification powered by zero-knowledge proofs
            </p>
            
            {/* Copyright */}
            <p className="text-xs text-gray-400">
              © 2025 ProofMe. All rights reserved.
            </p>
          </div>

          {/* Technical Information */}
          <div className="text-center mb-6">
            <div className="space-y-1 text-gray-300">
              <p className="text-sm">Powered by Citrea Network</p>
              <p className="text-sm">Supported Wallets - MetaMask (for now)</p>
              <div className="flex justify-center space-x-6 mt-3">
                <a 
                  href="https://docs.citrea.xyz/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors underline text-sm"
                >
                  Citrea Docs
                </a>
                <a 
                  href="https://blastapi.io/public-api/citrea" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors underline text-sm"
                >
                  API Reference
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
