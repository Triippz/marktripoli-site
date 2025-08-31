
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer (only in build mode)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-framer': ['framer-motion'],
          'vendor-mapbox': ['mapbox-gl'],
          'vendor-routing': ['react-router-dom'],
          
          // Feature chunks
          'features-map': [
            './src/components/map/MapboxScene.tsx',
            './src/components/map/FlightPathAnimations.tsx'
          ],
          'features-terminal': [
            './src/components/terminal/Terminal.tsx'
          ],
          'features-gamification': [
            './src/components/gamification/AchievementSystem.tsx'
          ],
          'features-side-missions': [
            './src/components/sideMissions/K9CompanionLogs.tsx',
            './src/components/sideMissions/ElectronicsLab.tsx',
            './src/components/sideMissions/GamingTerminal.tsx'
          ]
        }
      }
    },
    
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Enable source maps in production for debugging
    sourcemap: true,
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },
  
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'react-router-dom',
      'zustand'
    ]
  },
  
  // Mapbox GL JS worker handling
  define: {
    global: 'globalThis',
  },
  
  // Worker handling for Mapbox GL JS
  worker: {
    format: 'es'
  },
  
  // Server configuration
  server: {
    port: 5173,
    host: true,
    // Enable HMR for better development experience
    hmr: {
      overlay: true
    }
  },
  
  // Preview server configuration
  preview: {
    port: 5173,
    host: true
  }
})
