import React from 'react';

interface DroneIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DroneIcon: React.FC<DroneIconProps> = ({ 
  size = 32, 
  className = '', 
  style = {} 
}) => {
  return (
    <div 
      className={`relative ${className}`} 
      style={{ 
        width: size, 
        height: size, 
        ...style 
      }}
    >
      {/* SVG Drone Icon */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 128 128" 
        className="absolute inset-0"
        style={{ filter: 'drop-shadow(0 0 8px rgba(69, 255, 176, 0.8))' }}
      >
        {/* Main drone body - using the visible path from the SVG */}
        <path 
          d="M118.4,101.3c0,9.4-7.5,17-16.8,17v1.6c10.1,0,18.4-8.3,18.4-18.6H118.4z M9.6,101.3H8c0,10.3,8.2,18.6,18.4,18.6v-1.6C17.2,118.3,9.6,110.6,9.6,101.3z M101.6,8.1v1.6c9.3,0,16.8,7.6,16.8,17h1.6C120,16.5,111.7,8.1,101.6,8.1z M8,27h1.6c0-9.4,7.5-17,16.8-17V8.4C16.3,8.4,8,16.7,8,27z M101.6,74.5c-5.9,0-11.3,1.9-15.6,5.2l-2.4-2.8c-6.2-7.3-6.2-18,0-25.3l2.7-3.1c4.3,3.1,9.6,5,15.3,5c14.6,0,26.4-12,26.4-26.7C128,12,116.2,0,101.6,0C87.1,0,75.2,12,75.2,26.7c0,5.3,1.5,10.2,4.1,14.4L76,44c-7.2,6.3-17.8,6.3-25,0l-2.7-2.3c2.8-4.3,4.5-9.4,4.5-14.9C52.8,12,41,0,26.4,0C11.9,0,0,12,0,26.7c0,14.7,11.9,26.7,26.4,26.7c5.5,0,10.5-1.7,14.8-4.6l2.3,2.7c6.2,7.3,6.2,18,0,25.3l-2,2.4c-4.3-3-9.5-4.8-15.1-4.8C11.9,74.5,0,86.5,0,101.3C0,116,11.9,128,26.4,128c14.6,0,26.4-12,26.4-26.7c0-5.3-1.6-10.3-4.3-14.5l2.5-2.2c7.2-6.3,17.8-6.3,25,0l3.1,2.7c-2.5,4.1-3.9,8.9-3.9,14c0,14.7,11.9,26.7,26.4,26.7c14.6,0,26.4-12,26.4-26.7C128,86.5,116.2,74.5,101.6,74.5z"
          fill="currentColor"
          className="text-green-400"
        />
        
        {/* Rotor blades - simplified representation */}
        <circle cx="40" cy="40" r="3" fill="currentColor" className="text-green-300" opacity="0.8"/>
        <circle cx="88" cy="40" r="3" fill="currentColor" className="text-green-300" opacity="0.8"/>
        <circle cx="40" cy="88" r="3" fill="currentColor" className="text-green-300" opacity="0.8"/>
        <circle cx="88" cy="88" r="3" fill="currentColor" className="text-green-300" opacity="0.8"/>
      </svg>
      
      {/* Pulsing glow effect */}
      <div
        className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"
        style={{
          animationDuration: '2s',
          animationIterationCount: 'infinite'
        }}
      />
    </div>
  );
};

export default DroneIcon;