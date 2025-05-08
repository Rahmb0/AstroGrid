import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: '0.0.0.0',
    cors: true,
    hmr: {
      clientPort: 443,
    },
    // Allow Replit domains
    allowedHosts: [
      'f8089396-59c9-4634-9040-8c1d9400bdeb-00-1nxs8i06lsc0g.picard.replit.dev',
      'localhost',
      '0.0.0.0',
      '127.0.0.1',
      '.replit.dev',
      '.repl.co',
    ],
  },
  build: {
    outDir: 'dist',
  },
  define: {
    // Define environment variables for the frontend
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.ASTROGRID_REGISTRY_CANISTER_ID': JSON.stringify('rrkah-fqaaa-aaaaa-aaaaq-cai'),
    'process.env.CREDENTIAL_MANAGER_CANISTER_ID': JSON.stringify('ryjl3-tyaaa-aaaaa-aaaba-cai'),
    'process.env.II_URL': JSON.stringify('https://identity.ic0.app'),
  },
});