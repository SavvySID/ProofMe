import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAccount, useNetwork } from 'wagmi'
import logoImage from '../assets/ProofMe.png'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  Shield, 
  Zap, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  Lock, 
  Globe, 
  Gamepad2, 
  Coins, 
  Smartphone 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import WalletConnect from '../components/WalletConnect'

const Home: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const [verificationStatus, setVerificationStatus] = useState({
    verified: false,
    timestamp: 0
  })
  const [error, setError] = useState<string | null>(null)
  


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



  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden" style={{minHeight: '100vh', height: '100%'}}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="px-4 py-16 relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center py-20">
            <div className="flex justify-center items-center mb-8 animate-bounce-slow">
              <img 
                src={logoImage} 
                alt="ProofMe Logo" 
                className="h-20 w-20 mr-6 drop-shadow-lg hover:drop-shadow-2xl transition-all duration-500 transform hover:scale-110"
              />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                ProofMe
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Privacy-first age verification powered by zero-knowledge proofs on Bitcoin
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Prove you're over 18 without revealing your exact birth date. Our advanced cryptography ensures your privacy while meeting age verification requirements across platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isConnected ? (
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-6 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg border-0">
                  <Link to="/proof">
                    {verificationStatus.verified ? 'View Proof Status' : 'Start Verification'}
                  </Link>
                </Button>
              ) : (
                <WalletConnect 
                  onWalletConnected={(address, chainId) => {
                    console.log('Wallet connected:', address, chainId)
                  }}
                  verificationStatus={verificationStatus}
                />
              )}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transform hover:scale-105 py-6 px-8 rounded-xl transition-all duration-300"
              >
                <a href="#how-it-works">
                  Learn More
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-4 flex justify-center">
                  <Lock className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Private</h3>
                <p className="text-gray-700 text-sm">
                  Your birth date is never stored or transmitted. Only cryptographic proofs exist.
                </p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-4 flex justify-center">
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Verification</h3>
                <p className="text-gray-700 text-sm">
                  Get verified in seconds with zero-knowledge proofs on the Bitcoin blockchain.
                </p>
              </CardContent>
            </Card>
            <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-4 flex justify-center">
                  <Globe className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-Platform</h3>
                <p className="text-gray-700 text-sm">
                  Use your proof anywhere - DeFi, NFTs, gaming, and age-restricted content.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Status */}
          {isConnected && (
            <div className="mb-16 max-w-2xl mx-auto">
              <WalletConnect 
                onWalletConnected={(address, chainId) => {
                  console.log('Wallet connected:', address, chainId)
                }}
                verificationStatus={verificationStatus}
              />
            </div>
          )}



          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-4 flex justify-center">
                  <Lock className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl text-gray-900 mb-4 font-semibold">Zero-Knowledge Proofs</h3>
                <p className="text-gray-700">
                  Advanced cryptography allows you to prove you meet age requirements without revealing your actual birth date or any personal information. Your privacy is mathematically guaranteed.
                </p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-4 flex justify-center">
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="text-xl text-gray-900 mb-4 font-semibold">Bitcoin Native</h3>
                <p className="text-gray-700">
                  Built on Citrea zkEVM, leveraging Bitcoin's unparalleled security and decentralization. Your proofs are stored on the most secure blockchain network in the world.
                </p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-4 flex justify-center">
                  <RefreshCw className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl text-gray-900 mb-4 font-semibold">Reusable Proofs</h3>
                <p className="text-gray-700">
                  Generate once, use anywhere. Your proof is cryptographically verified and valid across all supported platforms, eliminating the need for repeated verification.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Technology Overview */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Revolutionary Technology
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <Lock className="h-5 w-5 text-blue-500 mr-3" />
                    Privacy by Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Our zero-knowledge proof system ensures that your personal information never leaves your device. The cryptographic proof contains no identifiable data, only mathematical proof that you meet age requirements.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• No personal data collection or storage</li>
                    <li>• Local computation in your browser</li>
                    <li>• Mathematical privacy guarantees</li>
                    <li>• GDPR and COPPA compliant</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <Zap className="h-5 w-5 text-green-500 mr-3" />
                    Lightning Fast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Experience instant age verification with our optimized zero-knowledge proof system. From wallet connection to verified status in under 30 seconds.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Proof generation in seconds</li>
                    <li>• Instant blockchain verification</li>
                    <li>• Real-time status updates</li>
                    <li>• Cross-platform compatibility</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Where You Can Use ProofMe
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <CardContent className="text-center p-6">
                  <div className="text-2xl mb-4 flex justify-center">
                    <Globe className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Web Platforms</h3>
                  <p className="text-gray-600 text-sm">
                    Age-restricted websites, content platforms, and online services
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <CardContent className="text-center p-6">
                  <div className="text-2xl mb-4 flex justify-center">
                    <Gamepad2 className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gaming</h3>
                  <p className="text-gray-600 text-sm">
                    Video games, gaming platforms, and esports services
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <CardContent className="text-center p-6">
                  <div className="text-2xl mb-4 flex justify-center">
                    <Coins className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">DeFi & NFTs</h3>
                  <p className="text-gray-600 text-sm">
                    Decentralized finance protocols and NFT marketplaces
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <CardContent className="text-center p-6">
                  <div className="text-2xl mb-4 flex justify-center">
                    <Smartphone className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Apps</h3>
                  <p className="text-gray-600 text-sm">
                    Mobile applications requiring age verification
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mb-20">
            <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
              <CardContent className="p-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Ready to Experience Privacy-First Age Verification?
                </h2>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                  Join thousands of users who trust ProofMe for secure, private, and instant age verification. 
                  No personal data, no delays, just mathematical proof of your age.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {isConnected ? (
                    <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg border-0">
                      <Link to="/proof">
                        {verificationStatus.verified ? 'View Your Proof' : 'Get Verified Now'}
                      </Link>
                    </Button>
                  ) : (
                    <WalletConnect 
                      onWalletConnected={(address, chainId) => {
                        console.log('Wallet connected:', address, chainId)
                      }}
                      verificationStatus={verificationStatus}
                    />
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transform hover:scale-105 py-4 px-8 rounded-xl transition-all duration-300"
                  >
                    <a href="#how-it-works">
                      Learn How It Works
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card id="how-it-works" className="p-10 backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] mb-20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-500 mr-2" />
                    For Users
                  </h3>
                  <ol className="space-y-4">
                    <li className="flex items-start group">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">1</span>
                      <div className="pt-1">
                        <span className="text-base font-medium text-gray-900">Connect your wallet to ProofMe</span>
                        <p className="text-gray-600 text-sm mt-1">Link your cryptocurrency wallet to start the verification process</p>
                      </div>
                    </li>
                    <li className="flex items-start group">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">2</span>
                      <div className="pt-1">
                        <span className="text-base font-medium text-gray-900">Enter your birth year (never stored)</span>
                        <p className="text-gray-600 text-sm mt-1">Input your birth year locally - this information never leaves your device</p>
                      </div>
                    </li>
                    <li className="flex items-start group">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">3</span>
                      <div className="pt-1">
                        <span className="text-base font-medium text-gray-900">Generate a zero-knowledge proof</span>
                        <p className="text-sm text-gray-600 mt-1">Our system creates a cryptographic proof of your age locally</p>
                      </div>
                    </li>
                    <li className="flex items-start group">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">4</span>
                      <div className="pt-1">
                        <span className="text-base font-medium text-gray-900">Submit proof to blockchain for verification</span>
                        <p className="text-sm text-gray-600 mt-1">Your proof is submitted to the Bitcoin blockchain for permanent verification</p>
                      </div>
                    </li>
                  </ol>
                </div>
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    For Verifiers
                  </h3>
                  <ol className="space-y-4">
                    <li className="flex items-start group">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">1</span>
                      <div className="pt-1">
                        <span className="text-base font-medium text-gray-900">Check user's wallet address on blockchain</span>
                        <p className="text-sm text-gray-600 mt-1">Verify the user's wallet address against the blockchain records</p>
                      </div>
                    </li>
                    <li className="flex items-start group">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">2</span>
                      <div className="pt-1">
                        <span className="text-base font-medium text-gray-900">Verify the zero-knowledge proof</span>
                        <p className="text-sm text-gray-600 mt-1">Cryptographically verify the mathematical proof of age</p>
                      </div>
                    </li>
                    <li className="flex items-start group">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">3</span>
                      <div className="pt-1">
                        <span className="text-base font-medium text-gray-900">Confirm age requirement is met</span>
                        <p className="text-sm text-gray-600 mt-1">Ensure the user meets the minimum age requirement (18+)</p>
                      </div>
                    </li>
                    <li className="flex items-start group">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">4</span>
                      <div className="pt-1">
                        <span className="text-base font-medium text-gray-900">Grant access without collecting personal data</span>
                        <p className="text-sm text-gray-600 mt-1">Provide access while maintaining user privacy and compliance</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home 