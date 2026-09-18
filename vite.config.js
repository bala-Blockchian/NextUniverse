import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep a single copy of the wallet stack in the browser bundle — duplicate
  // module instances are a known cause of "connector.getChainId is not a function".
  resolve: {
    dedupe: ['wagmi', 'viem', '@wagmi/core', '@wagmi/connectors', '@tanstack/react-query'],
  },
  optimizeDeps: {
    include: ['wagmi', 'viem', '@wagmi/core', '@wagmi/connectors', '@rainbow-me/rainbowkit'],
  },
})
