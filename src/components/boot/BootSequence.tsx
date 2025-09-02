import { useState, useEffect, useMemo } from 'react';
import { useMissionControl } from '../../store/missionControl';
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
  const [authComplete, setAuthComplete] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [remember, setRemember] = useState<boolean>(() => localStorage.getItem('mc-remember') === 'true');
  const { setUserName, addTelemetry } = useMissionControl();
  
  useEffect(() => {
    const stored = localStorage.getItem('mc-user');
    if (stored) setUsername(stored);
    // Auto-skip auth if user opted to be remembered
    if (stored && localStorage.getItem('mc-remember') === 'true') {
      setUserName(stored);
      addTelemetry({ source: 'AUTH', message: `Operator auto-authenticated: ${stored}` , level: 'success' });
      setAuthComplete(true);
    }
  }, []);

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
    if (!authComplete) return;
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
  }, [currentMessage, onComplete, authComplete]);

  const handleAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const u = username.trim();
    if (!u) {
      setAuthMessage('Enter a valid callsign');
      return;
    }

    // Fun easter eggs (password is aesthetic only)
    const uname = u.toLowerCase();
    if (uname === 'admin') {
      setAuthMessage('ACCESS DENIED: Root privileges restricted by Mission Control');
      addTelemetry({ source: 'AUTH', message: 'Unauthorized root attempt detected', level: 'warning' });
      return; // Prevent login for admin username
    }
    // Determine message and delay so users can read it
    let proceedDelay = 400;
    if (uname === 'guest') {
      setAuthMessage('Welcome, Guest Operator. Limited-access mode engaged.');
      proceedDelay = 2200;
    } else if (uname === 'mark') {
      setAuthMessage('Welcome back, Papi. We missed you.');
      proceedDelay = 2200;
    } else if (uname === 'neo') {
      setAuthMessage('Welcome, Neo. Bending spoons protocol enabled.');
      proceedDelay = 2200;
    } else if (uname === 'deez') {
        setAuthMessage('DEEZ NUTZ');
        proceedDelay = 2200;
    } else {
      setAuthMessage(null);
    }

    setUserName(u);
    try { localStorage.setItem('mc-remember', remember ? 'true' : 'false'); } catch {}
    addTelemetry({ source: 'AUTH', message: `Operator authenticated: ${u}`, level: 'success' });
    setTimeout(() => setAuthComplete(true), proceedDelay);
  };

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
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.28) 0%, rgba(17,17,17,0.18) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,255,0,0.12)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,255,0,0.08), inset 0 1px 0 rgba(255,255,255,0.04)'
          }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Authentication step */}
          {!authComplete && (
            <div className="max-w-md mx-auto mb-8">
              <div className="text-center mb-8">
                <div className="holo-text font-mono text-2xl mb-2">MISSION CONTROL ACCESS</div>
                <div className="text-gray-400 font-mono text-xs">Identify yourself to proceed</div>
              </div>
              <form onSubmit={handleAuth} className="tactical-glass p-4 border border-green-500/20 rounded-md">
                <label className="block text-green-400 font-mono text-xs mb-1">USERNAME</label>
                <input 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-green-500/30 rounded px-3 py-2 font-mono text-sm text-green-100 focus:outline-none focus:border-green-400 mb-3"
                  placeholder="Enter callsign"
                  autoFocus
                />
                <label className="block text-green-400 font-mono text-xs mb-1">PASSWORD</label>
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-green-500/30 rounded px-3 py-2 font-mono text-sm text-green-100 focus:outline-none focus:border-green-400 mb-4"
                  placeholder="Enter cipher"
                />
                <label className="flex items-center gap-2 text-green-300 font-mono text-xs mb-4 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="appearance-none w-4 h-4 border border-green-500/40 rounded-sm bg-black/40 checked:bg-green-500/70 checked:border-green-400 transition-colors"
                    aria-label="Remember me"
                  />
                  Remember me
                </label>
                {authMessage && (
                  <div className="text-yellow-400 font-mono text-xs mb-3">{authMessage}</div>
                )}
                <div className="flex gap-2 justify-end">
                  <button 
                    type="button"
                    onClick={() => { setUsername('guest'); setPassword('guest'); }}
                    className="tactical-button text-xs px-3 py-2"
                  >
                    Use Guest
                  </button>
                  <button type="submit" className="tactical-button text-xs px-3 py-2">Engage</button>
                </div>
              </form>
            </div>
          )}

          {/* Boot content */}
          {authComplete && (
          <>
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
          </>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
