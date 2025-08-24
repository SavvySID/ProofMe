import React from 'react';
import logoImage from '../assets/ProofMe.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white border-t border-gray-800/50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Company/Project Information */}
          <div className="text-center mb-10">
            {/* ProofMe Logo */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-slate-50/50 via-blue-50/50 to-indigo-50/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <img 
                  src={logoImage} 
                  alt="ProofMe Logo" 
                  className="h-12 w-12 rounded-xl drop-shadow-lg"
                />
              </div>
            </div>
            
            {/* Tagline */}
            <p className="body-text text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
              Privacy-first age verification powered by zero-knowledge proofs
            </p>
            
            {/* Copyright */}
            <p className="caption-text text-gray-400">
              © 2025 ProofMe. All rights reserved.
            </p>
          </div>

          {/* Technical Information */}
          <div className="text-center mb-8">
            <div className="space-y-3 text-gray-300">
              <p className="text-sm font-medium">Powered by Citrea Network</p>
              <p className="text-sm">Supported Wallets - MetaMask (for now)</p>
              <div className="flex justify-center space-x-8 mt-6">
                <a 
                  href="https://docs.citrea.xyz/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-all duration-300 underline text-sm hover:no-underline hover:bg-blue-400/10 px-3 py-1 rounded-lg"
                >
                  Citrea Docs
                </a>
                <a 
                  href="https://blastapi.io/public-api/citrea" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-all duration-300 underline text-sm hover:no-underline hover:bg-blue-400/10 px-3 py-1 rounded-lg"
                >
                  API Reference
                </a>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center space-x-4 opacity-30">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
