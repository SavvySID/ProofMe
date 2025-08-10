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