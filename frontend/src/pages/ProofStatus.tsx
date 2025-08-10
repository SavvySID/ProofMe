import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { ZKProof } from '../utils/zkProof'

const ProofStatus: React.FC = () => {
  const location = useLocation()
  const {
    walletState,
    verificationStatus,
    isLoading,
    error,
    connectWallet,
    checkStatus
  } = useWallet()

  const proofData = location.state as {
    proof: ZKProof
    birthYear: string
    timestamp: string
    verified: boolean
  } | null

  useEffect(() => {
    // Check verification status on component mount
    if (walletState.isConnected) {
      checkStatus()
    }
  }, [walletState.isConnected, checkStatus])

  // Check if contracts are deployed on current network
  const getContractsStatus = () => {
    if (!walletState.chainId) return { deployed: false, message: 'Network not detected' }
    
    if (walletState.chainId === 1337) {
      return { deployed: true, message: 'Connected to Localhost' }
    } else if (walletState.chainId === 5115) {
      // Check Citrea testnet contract addresses
      const citreaContracts = {
        AgeVerifier: "0x0000000000000000000000000000000000000000",
        ProofRegistry: "0x0000000000000000000000000000000000000000"
      }
      const deployed = citreaContracts.AgeVerifier !== "0x0000000000000000000000000000000000000000"
      return { 
        deployed, 
        message: deployed ? 'Connected to Citrea Testnet' : 'Contracts not deployed to Citrea Testnet' 
      }
    } else {
      return { deployed: false, message: 'Unsupported network' }
    }
  }

  const contractsStatus = getContractsStatus()

  // Generate proof content for download/print
  const generateProofContent = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ProofMe Age Verification Certificate</title>
    <style>
        @page {
            size: A4;
            margin: 0.5in;
        }
        body {
            font-family: Arial, sans-serif;
            max-width: 100%;
            margin: 0;
            padding: 10px;
            line-height: 1.4;
            color: #333;
            font-size: 12px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .certificate-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            background: #f3f4f6;
            padding: 12px;
            border-radius: 6px;
            margin: 15px 0;
            border-left: 3px solid #2563eb;
        }
        .details-section {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 6px 0;
            padding: 4px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-label {
            font-weight: bold;
            color: #374151;
            font-size: 11px;
        }
        .detail-value {
            color: #6b7280;
            font-family: monospace;
            font-size: 11px;
        }
        .verification-list {
            background: #ecfdf5;
            padding: 12px;
            border-radius: 6px;
            border-left: 3px solid #10b981;
            margin: 10px 0;
        }
        .verification-item {
            margin: 4px 0;
            color: #065f46;
            font-size: 11px;
        }
        .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 10px;
        }
        .status-verified {
            color: #10b981;
            font-weight: bold;
        }
        .status-pending {
            color: #f59e0b;
            font-weight: bold;
        }
        h3 {
            margin: 8px 0 6px 0;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🛡️ ProofMe</div>
        <div class="subtitle">Zero-Knowledge Age Verification Certificate</div>
    </div>

    <div class="certificate-title">
        PROOF CERTIFICATE
        <br/>
        <small style="font-size: 16px; font-weight: normal; color: #666;">
            This document certifies that the wallet address holder has successfully proven 
            they are over 18 years old using zero-knowledge cryptographic proofs.
        </small>
    </div>

    <div class="details-section">
        <h3 style="margin-top: 0; color: #374151;">Proof Details</h3>
        <div class="detail-row">
            <span class="detail-label">Proof ID:</span>
            <span class="detail-value">${proofData?.proof ? 'ZK_' + Date.now().toString(36) : 'N/A'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Birth Year:</span>
            <span class="detail-value">${proofData?.birthYear || 'N/A'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Generated:</span>
            <span class="detail-value">${proofData?.timestamp ? new Date(proofData.timestamp).toLocaleString() : 'N/A'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Wallet Address:</span>
            <span class="detail-value">${walletState.address || 'N/A'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Blockchain Status:</span>
            <span class="detail-value ${verificationStatus.verified ? 'status-verified' : 'status-pending'}">
                ${verificationStatus.verified ? 'Verified ✓' : 'Pending ⏳'}
            </span>
        </div>
        ${verificationStatus.verified && verificationStatus.timestamp > 0 ? `
        <div class="detail-row">
            <span class="detail-label">Verification Date:</span>
            <span class="detail-value">${new Date(verificationStatus.timestamp * 1000).toLocaleString()}</span>
        </div>
        ` : ''}
    </div>

    <div class="verification-list">
        <h3 style="margin-top: 0; color: #065f46;">What This Means</h3>
        <div class="verification-item">✓ You have successfully proven you are over 18 years old</div>
        <div class="verification-item">✓ Your actual birth date remains private and secure</div>
        <div class="verification-item">✓ This proof can be used across multiple platforms</div>
        <div class="verification-item">✓ The verification is cryptographically secure</div>
        <div class="verification-item">✓ Your proof is permanently stored on the blockchain</div>
    </div>

    <div class="footer">
        <strong>Generated by ProofMe</strong><br/>
        Privacy-first age verification powered by zero-knowledge proofs<br/>
        ${new Date().toLocaleString()}<br/><br/>
        This document is cryptographically verifiable on the blockchain.<br/>
        Visit the blockchain explorer to verify this proof independently.
    </div>
</body>
</html>`
  }

  // Handle PDF download
  const handleDownloadProof = () => {
    if (!proofData && !verificationStatus.verified) {
      alert('No proof data available to download')
      return
    }

    const htmlContent = generateProofContent()
    
    // Create a new window with the content
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load, then trigger download as PDF
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    }
  }

  // Handle direct print
  const handlePrintProof = () => {
    if (!proofData && !verificationStatus.verified) {
      alert('No proof data available to print')
      return
    }

    const htmlContent = generateProofContent()
    
    // Create a new window with the content for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }, 500)
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
                You need to connect your wallet to view your proof status.
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Proof Status</h2>
              <p className="text-gray-600">
                Your age verification proof status and blockchain verification.
              </p>
            </div>

            {/* Wallet Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Connected Wallet</h3>
              <p className="text-blue-700 font-mono text-sm">
                {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
              </p>
            </div>

            {/* Contract Status Warning */}
            {!contractsStatus.deployed && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2">⚠️ Contracts Not Available</h3>
                <p className="text-red-700 text-sm mb-2">
                  {contractsStatus.message}
                </p>
                {walletState.chainId === 5115 && (
                  <p className="text-red-600 text-xs">
                    ProofMe contracts are not yet deployed to Citrea Testnet. Please switch to Localhost (Chain ID: 1337) for testing.
                  </p>
                )}
              </div>
            )}
            
            {proofData || verificationStatus.verified ? (
              <div className="space-y-6">
                {/* Verification Status */}
                <div className={`rounded-lg p-4 ${
                  verificationStatus.verified 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    verificationStatus.verified ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {verificationStatus.verified ? '✅ Proof Verified on Blockchain' : '⏳ Proof Pending Verification'}
                  </h3>
                  <p className={`text-sm ${
                    verificationStatus.verified ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {verificationStatus.verified 
                      ? 'Your age verification proof has been successfully verified and stored on the blockchain.'
                      : 'Your proof is being processed on the blockchain.'
                    }
                  </p>
                  {verificationStatus.verified && verificationStatus.timestamp > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      Verified on {new Date(verificationStatus.timestamp * 1000).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Proof Details */}
                {proofData && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Proof Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proof ID:</span>
                        <span className="font-mono">
                          {proofData.proof ? 'ZK_' + Date.now().toString(36) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Birth Year:</span>
                        <span>{proofData.birthYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Generated:</span>
                        <span>{new Date(proofData.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wallet Address:</span>
                        <span className="font-mono">{walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blockchain Status:</span>
                        <span className={verificationStatus.verified ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                          {verificationStatus.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* What This Means */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">What This Means</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You have successfully proven you are over 18 years old</li>
                    <li>• Your actual birth date remains private and secure</li>
                    <li>• This proof can be used across multiple platforms</li>
                    <li>• The verification is cryptographically secure</li>
                    <li>• Your proof is permanently stored on the blockchain</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button 
                      onClick={handleDownloadProof}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download PDF</span>
                    </button>
                    <button 
                      onClick={handlePrintProof}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Print</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/proof'}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Generate New Proof
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Proof Found</h3>
                <p className="text-gray-600 mb-6">
                  You haven't generated any age verification proofs yet.
                </p>
                <button 
                  onClick={() => window.location.href = '/proof'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Generate Your First Proof
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProofStatus 