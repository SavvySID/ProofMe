/// <reference types="react" />

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (eventName: string, handler: (...args: any[]) => void) => void
      removeListener: (eventName: string, handler: (...args: any[]) => void) => void
      isMetaMask?: boolean
    }
  }
}

// This export is required to make this a module
export {}

export interface TransactionStatus {
  hash: string
  status: 'pending' | 'confirming' | 'confirmed' | 'failed' | 'network_error'
  confirmations: number
  requiredConfirmations: number
  timestamp: number
  error?: string
  receipt?: any
}

export interface ProofData {
  proof: ZKProof
  birthYear: string
  timestamp: string
  verified: boolean
  transactionHash?: string
  transactionStatus?: TransactionStatus
} 