import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackendEngineerDisclaimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BackendEngineerDisclaimer({ isOpen, onClose }: BackendEngineerDisclaimerProps) {
  const [currentText, setCurrentText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);

  const fullText = `> WARNING: UNAUTHORIZED FRONTEND DETECTED
> 
> SYSTEM ALERT: This interface was crafted by a
> BACKEND ENGINEER attempting frontend operations.
> 
> [!] Expect database-grade over-engineering
> [!] API-first thinking applied to CSS
> [!] Microservice architecture in components
> 
> BACKEND > FRONTEND
> 
> Press any key to continue...`;

  useEffect(() => {
    if (!isOpen) {
      setCurrentText('');
      setAnimationComplete(false);
      return;
    }

    let currentIndex = 0;
    const typingSpeed = 30;

    const typeText = () => {
      if (currentIndex < fullText.length) {
        setCurrentText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeText, typingSpeed);
      } else {
        setAnimationComplete(true);
      }
    };

    const timer = setTimeout(typeText, 500);
    return () => clearTimeout(timer);
  }, [isOpen, fullText]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = () => {
      if (animationComplete) {
        onClose();
      }
    };

    const handleClick = () => {
      if (animationComplete) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('click', handleClick);
    };
  }, [isOpen, animationComplete, onClose]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 600);

    return () => clearInterval(cursorInterval);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center"
        style={{ zIndex: 99999 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse" 
               style={{
                 backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)',
                 animation: 'scanlines 0.1s linear infinite'
               }} 
          />
        </div>

        {/* Main Terminal Window */}
        <motion.div
          className="bg-black border-2 border-green-500 rounded-lg shadow-2xl shadow-green-500/20 max-w-2xl w-full mx-4 overflow-hidden"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Terminal Header */}
          <div className="bg-green-500/10 border-b border-green-500/30 px-4 py-2 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-500 text-sm font-mono ml-4">
              backend_engineer@frontend_attempt:~$
            </span>
          </div>

          {/* Terminal Content */}
          <div className="p-6 font-mono text-green-400 min-h-[400px]">
            <pre className="text-sm leading-relaxed whitespace-pre-wrap">
              {currentText}
              {showCursor && <span className="bg-green-400 text-black">█</span>}
            </pre>

            {/* Glitch overlay for extra cyberpunk feel */}
            <motion.div
              className="absolute inset-0 bg-green-500/5"
              animate={{
                opacity: [0, 0.3, 0],
                x: [0, 2, -2, 0]
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3 + 2
              }}
            />

            {animationComplete && (
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-green-300 text-xs">
                  ▲ Click anywhere or press any key to continue ▲
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Matrix rain effect in background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-500/20 font-mono text-xs"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px'
              }}
              animate={{
                y: window.innerHeight + 20,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              {Math.random().toString(36).substring(7)}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
      `}</style>
    </AnimatePresence>
  );
}