/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mc-black': '#000000',
        'mc-panel': '#111111', 
        'mc-green': '#00ff00',
        'mc-green-glow': 'rgba(0, 255, 0, 0.3)',
        'mc-white': '#ffffff',
        'mc-gray': 'rgba(255, 255, 255, 0.6)'
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'typewriter': 'typewriter 0.05s steps(1) forwards',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(0, 255, 0, 0.3), 0 0 10px rgba(0, 255, 0, 0.2)' 
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.6), 0 0 30px rgba(0, 255, 0, 0.4)' 
          }
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 255, 0, 0.3)',
        'glow-strong': '0 0 40px rgba(0, 255, 0, 0.5)'
      }
    }
  },
  plugins: []
}