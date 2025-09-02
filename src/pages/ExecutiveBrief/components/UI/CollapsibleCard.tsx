import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleCardProps {
  title: string;
  storageKey: string;
  defaultExpanded?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function CollapsibleCard({ 
  title, 
  storageKey, 
  defaultExpanded = true, 
  className = "mission-panel p-6 md:p-8 mb-6",
  children 
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useEffect(() => {
    const stored = localStorage.getItem(`collapse-${storageKey}`);
    if (stored !== null) {
      setIsExpanded(stored === 'true');
    }
  }, [storageKey]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem(`collapse-${storageKey}`, String(newState));
  };

  return (
    <div className={className}>
      <div 
        className="flex items-center justify-between cursor-pointer mb-3 group"
        onClick={handleToggle}
      >
        <div className="holo-text font-mono text-lg">{title}</div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-green-400 group-hover:text-green-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12L3 7h10l-5 5z"/>
          </svg>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}