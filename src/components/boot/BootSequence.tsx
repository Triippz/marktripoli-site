import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MapboxGlobe from '../MapboxGlobe';

interface BootSequenceProps {
  onComplete: () => void;
}

// Boot sequence messages
const bootMessages = [
  'INIT SYSTEMS...',
  'VERIFYING KEYS...',
  'HANDSHAKE OK...',
  'AUTH MARK TRIPOLI...',
  'SECURE LINK ESTABLISHED.',
  'ENTERING MISSION CONTROL...'
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (currentMessage >= bootMessages.length) {
      setTimeout(onComplete, 1000);
      return;
    }

    const message = bootMessages[currentMessage];
    let charIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (charIndex <= message.length) {
        setDisplayText(message.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentMessage(prev => prev + 1);
        }, 500);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentMessage, onComplete]);

  return (
    <>
      {/* Background Globe */}
      <MapboxGlobe />
      
      {/* Boot Sequence Overlay */}
      <motion.div 
        className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center z-50 px-4"
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="mission-panel w-full max-w-[90vw] md:max-w-4xl p-6 md:p-8 lg:p-12"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-16">
            <motion.div 
              className="holo-text font-mono text-2xl md:text-4xl mb-6"
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(0, 255, 0, 0.5)',
                  '0 0 30px rgba(0, 255, 0, 0.8)',
                  '0 0 20px rgba(0, 255, 0, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              MISSION CONTROL v2.0
            </motion.div>
            <div className="text-green-400 font-mono text-base md:text-lg mb-2">
              TACTICAL OPERATIONS SYSTEM
            </div>
            <div className="text-gray-400 font-mono text-xs md:text-sm">
              Earth Surveillance Network • Global Command Interface
            </div>
          </div>
          
          <div className="w-full">
            <div className="text-center mb-10">
              <div className="matrix-text text-xl mb-4 h-8 flex items-center justify-center">
                <span className="terminal-cursor">{displayText}</span>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative w-full">
              <div className="w-full bg-gray-900/50 rounded-full h-3 mb-6 border border-green-500/20">
                <motion.div 
                  className="relative h-full rounded-full overflow-hidden"
                  style={{
                    background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 50%, #00ff00 100%)',
                    boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentMessage + 1) / bootMessages.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Animated scanner line */}
                  <motion.div
                    className="absolute top-0 right-0 w-8 h-full bg-gradient-to-r from-transparent to-white/30"
                    animate={{ x: [-32, 8] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
              
              <div className="flex justify-between text-green-400 font-mono text-sm">
                <span>INITIALIZATION PROGRESS</span>
                <span>{Math.round(((currentMessage + 1) / bootMessages.length) * 100)}% COMPLETE</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}