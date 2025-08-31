import { useEffect, useState } from 'react';

interface BackgroundGlobeProps {
  className?: string;
}

function BackgroundGlobe({ className = '' }: BackgroundGlobeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading time like a real map would have
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ 
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)'
      }}
    >
      {/* CSS-based spinning Earth */}
      <div 
        className="w-full h-full relative"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 2s ease-in-out'
        }}
      >
        {/* Earth sphere with continents pattern */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            width: '120vmin',
            height: '120vmin',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: `
              radial-gradient(circle at 30% 30%, #2d4a3d 0%, #1a2f23 25%, #0f1a14 50%),
              conic-gradient(from 0deg, 
                #0f1a14 0deg, #1a2f23 30deg, #2d4a3d 60deg, 
                #1a2f23 90deg, #0f1a14 120deg, #2d4a3d 150deg,
                #1a2f23 180deg, #0f1a14 210deg, #2d4a3d 240deg,
                #1a2f23 270deg, #0f1a14 300deg, #2d4a3d 330deg, #0f1a14 360deg
              )
            `,
            backgroundBlendMode: 'multiply',
            animation: 'earthRotation 60s linear infinite',
            filter: 'brightness(0.4) contrast(1.2)',
            boxShadow: `
              inset -20px -20px 60px rgba(0, 0, 0, 0.8),
              inset 20px 20px 40px rgba(255, 255, 255, 0.1),
              0 0 100px rgba(0, 0, 0, 0.9)
            `
          }}
        >
          {/* Continent-like patterns */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                radial-gradient(ellipse 40% 20% at 25% 35%, #2d4a3d 0%, transparent 50%),
                radial-gradient(ellipse 30% 15% at 70% 25%, #2d4a3d 0%, transparent 50%),
                radial-gradient(ellipse 25% 35% at 80% 70%, #2d4a3d 0%, transparent 50%),
                radial-gradient(ellipse 35% 25% at 15% 75%, #2d4a3d 0%, transparent 50%),
                radial-gradient(ellipse 20% 20% at 60% 80%, #2d4a3d 0%, transparent 50%)
              `,
              animation: 'earthRotation 60s linear infinite',
            }}
          />
          
          {/* Cloud layer */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `
                radial-gradient(ellipse 60% 30% at 40% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse 45% 25% at 75% 60%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse 30% 20% at 20% 80%, rgba(255, 255, 255, 0.12) 0%, transparent 50%)
              `,
              animation: 'cloudRotation 90s linear infinite',
            }}
          />
        </div>

        {/* Subtle grid overlay for tactical feel */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, 0.03) 25%, rgba(0, 255, 0, 0.03) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.03) 75%, rgba(0, 255, 0, 0.03) 76%, transparent 77%),
              linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, 0.03) 25%, rgba(0, 255, 0, 0.03) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.03) 75%, rgba(0, 255, 0, 0.03) 76%, transparent 77%)
            `,
            backgroundSize: '80px 80px'
          }}
        />
      </div>
      
      {/* Loading state with starfield effect */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-green-500 font-mono text-sm animate-pulse">
            INITIALIZING EARTH SURVEILLANCE...
          </div>
          
          {/* Enhanced starfield background while loading */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 200 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  width: Math.random() > 0.8 ? '2px' : '1px',
                  height: Math.random() > 0.8 ? '2px' : '1px',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.2,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 2 + 1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BackgroundGlobe;