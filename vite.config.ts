import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better browser caching
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom'
          ],
          // Split lucide icons
          'icons': ['lucide-react'],
          // Split framer motion
          'animation': ['framer-motion'],
        }
      }
    },
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    middlewareMode: false,
  },
  preview: {
    middlewareMode: false,
  },
})
