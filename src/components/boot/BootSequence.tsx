import { useState, useEffect, useMemo } from 'react';
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

  // Compute continuous progress based on typed characters across all messages
  const totalChars = useMemo(() => bootMessages.reduce((sum, m) => sum + m.length, 0), []);
  const completedCharsBefore = useMemo(
    () => bootMessages.slice(0, Math.min(currentMessage, bootMessages.length)).reduce((sum, m) => sum + m.length, 0),
    [currentMessage]
  );
  const progressPercent = useMemo(() => {
    if (currentMessage >= bootMessages.length) return 100;
    const typedInCurrent = displayText.length;
    const p = totalChars > 0 ? ((completedCharsBefore + typedInCurrent) / totalChars) * 100 : 0;
    return Math.max(0, Math.min(p, 100));
  }, [currentMessage, displayText.length, completedCharsBefore, totalChars]);

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
          className="mission-panel w-full max-w-[90vw] md:max-w-4xl p-6 md:p-8 lg:p-12 pb-10 md:pb-12 lg:pb-16"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-16 px-4 md:px-6 pt-4 md:pt-6">
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
                TACTICAL OPERATIONS SYSTEM
            </motion.div>
            <div className="text-gray-400 font-mono text-xs md:text-sm">
              Global Command Interface
            </div>
          </div>
          
          <div className="w-full px-8 md:px-12">
            <div className="text-center mb-10">
              <div className="matrix-text text-xl mb-4 h-8 flex items-center justify-center">
                <span className="terminal-cursor">{displayText}</span>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative w-full pt-2 md:pt-3 pb-8 md:pb-10">
              <div className="w-full bg-gray-900/50 rounded-full h-3 mb-6 border border-green-500/20 overflow-hidden">
                <div 
                  className="relative h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 50%, #00ff00 100%)',
                    boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
                    width: `${progressPercent}%`,
                    transition: 'width 600ms ease-in-out'
                  }}
                >
                  {/* Animated scanner line */}
                  <motion.div
                    className="absolute top-0 right-0 w-8 h-full bg-gradient-to-r from-transparent to-white/30"
                    animate={{ x: [-32, 8] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-green-400 font-mono text-sm">
                <span>INITIALIZATION PROGRESS</span>
                <span>{Math.min(Math.round(progressPercent), 100)}% COMPLETE</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
