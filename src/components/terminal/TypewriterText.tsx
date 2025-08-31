import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  delay?: number; // delay before starting
  className?: string;
  onComplete?: () => void;
}

function TypewriterText({ 
  text, 
  speed = 50, 
  delay = 0, 
  className = '', 
  onComplete 
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const startTimer = setTimeout(() => {
        setIsStarted(true);
      }, delay);
      return () => clearTimeout(startTimer);
    } else {
      setIsStarted(true);
    }
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= text.length) {
        setDisplayText(text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(typeInterval);
  }, [text, speed, isStarted, onComplete]);

  return (
    <div className={`font-mono text-white ${className}`}>
      <span className="typewriter-cursor">{displayText}</span>
    </div>
  );
}

export default TypewriterText;