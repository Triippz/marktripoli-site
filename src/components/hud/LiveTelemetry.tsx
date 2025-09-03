import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { TelemetryEntry } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';

interface LiveTelemetryProps {
  telemetryLogs: TelemetryEntry[];
}

export default function LiveTelemetry({ telemetryLogs }: LiveTelemetryProps) {
  // Responsive state
  const { isMobile } = useResponsive();
  
  // Internal history buffer so the card keeps prior messages locally
  const [history, setHistory] = useState<TelemetryEntry[]>(telemetryLogs || []);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [pinToBottom, setPinToBottom] = useState(true);
  type PanelMode = 'expanded' | 'collapsed' | 'hidden';
  // Default to collapsed on mobile, expanded on desktop
  const [mode, setMode] = useState<PanelMode>('collapsed'); // Start collapsed for all, then adjust
  // Drag position state
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  // Set initial state based on device type after mount
  useEffect(() => {
    if (!isMobile && mode === 'collapsed') {
      setMode('expanded');
    }
  }, [isMobile]); // Remove mode from dependencies to prevent infinite loop

  // Merge incoming logs into local history (dedupe by timestamp+message+level)
  useEffect(() => {
    if (!telemetryLogs || telemetryLogs.length === 0) return;
    setHistory(prev => {
      const seen = new Set(prev.map(e => `${new Date(e.timestamp).getTime()}|${e.level}|${e.message}`));
      const additions = telemetryLogs.filter(e => {
        const key = `${new Date(e.timestamp).getTime()}|${e.level}|${e.message}`;
        return !seen.has(key);
      });
      const merged = [...prev, ...additions];
      // Keep a reasonable cap
      const cap = 200;
      return merged.length > cap ? merged.slice(merged.length - cap) : merged;
    });
  }, [telemetryLogs]);

  // Auto-scroll to bottom when new logs arrive if user is pinned to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (pinToBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [history, pinToBottom]);

  const latestLog = history.slice(-1)[0];

  // Determine colors and icons based on log level
  const getLogStyle = (level?: string) => {
    switch (level) {
      case 'error':
        return {
          indicatorColor: 'bg-red-500',
          textColor: 'text-red-400',
          messageColor: 'text-red-300',
          icon: '⚠️'
        };
      case 'warning':
        return {
          indicatorColor: 'bg-yellow-500',
          textColor: 'text-yellow-400',
          messageColor: 'text-yellow-300',
          icon: '⚠️'
        };
      case 'success':
        return {
          indicatorColor: 'bg-green-500',
          textColor: 'text-green-400',
          messageColor: 'text-green-300',
          icon: '✅'
        };
      case 'info':
      default:
        return {
          indicatorColor: 'bg-green-500',
          textColor: 'text-green-400',
          messageColor: 'text-green-300',
          icon: '🔗'
        };
    }
  };

  const logStyle = getLogStyle(latestLog?.level);
  // Mobile gets smaller heights, desktop gets larger
  const heightClass = mode === 'collapsed' 
    ? (isMobile ? 'h-16' : 'h-20')
    : (isMobile ? 'h-48' : 'h-48'); // Reduce mobile expanded height to fit screen

  // Fully hidden state: show a tiny restore button only
  if (mode === 'hidden') {
    return (
      <button
        onClick={() => {
          const newMode = isMobile ? 'collapsed' : 'expanded';
          setMode(newMode);
        }}
        className="fixed z-60 bg-gray-900/85 border border-green-500/40 text-green-300 font-mono text-xs px-3 py-1 rounded-full shadow backdrop-blur-sm hover:border-green-400/70 hover:text-green-200"
        style={{
          bottom: isMobile ? '5rem' : '5rem', // Move up on desktop to avoid Mapbox zoom controls
          right: '1rem'
        }}
        title="Show telemetry"
      >
        📡 Telemetry
      </button>
    );
  }

  return (
    <motion.div 
      className={`floating-card ${isMobile ? 'w-[calc(100vw-2rem)] max-w-sm' : ''}`}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{
        top: isMobile ? -window.innerHeight + 250 : -window.innerHeight + 150,
        left: -window.innerWidth + 100,
        right: isMobile ? 0 : window.innerWidth - 400,
        bottom: isMobile ? 80 : 0
      }}
      onDragEnd={(e, info) => {
        setDragPosition({ x: info.offset.x, y: info.offset.y });
      }}
      style={{ 
        position: 'fixed', 
        bottom: isMobile ? '5rem' : '1rem', // Move up on mobile to avoid zoom controls
        right: '1rem',
        left: isMobile ? '1rem' : 'auto',
        zIndex: 60,
        maxHeight: isMobile ? 'calc(100vh - 10rem)' : 'auto', // Ensure it doesn't go above viewport
        x: dragPosition.x,
        y: dragPosition.y,
        cursor: 'move'
      }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9 }}
      whileDrag={{ scale: 1.02, opacity: 0.9 }}
    >
      <div className="flex items-center mb-2">
        <div className={`w-2 h-2 ${logStyle.indicatorColor} rounded-full animate-pulse mr-2`} />
        <span className={`${logStyle.textColor} font-mono text-xs uppercase`}>
          Live Telemetry
        </span>
        {latestLog?.level === 'error' && (
          <span className="text-red-500 ml-1 animate-pulse">●</span>
        )}
        {/* Drag handle indicator */}
        <div className="text-green-500/50 ml-2 text-xs select-none" title="Drag to move">
          ⋮⋮
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              setDragPosition({ x: 0, y: 0 });
            }}
            className="border border-blue-500/30 text-blue-300 hover:text-blue-200 hover:border-blue-400/50 rounded px-2 py-0.5 font-mono text-[10px] uppercase"
            title="Reset position"
          >
            Reset
          </button>
          <button
            onClick={() => {
              setHistory([]);
              setPinToBottom(true);
              // Scroll to bottom after clear
              requestAnimationFrame(() => {
                const el = scrollRef.current;
                if (el) el.scrollTop = el.scrollHeight;
              });
            }}
            className="border border-green-500/30 text-green-300 hover:text-green-200 hover:border-green-400/50 rounded px-2 py-0.5 font-mono text-[10px] uppercase"
            title="Clear telemetry"
          >
            Clear
          </button>
          <button
            onClick={() => {
              setMode(prev => prev === 'expanded' ? 'collapsed' : 'expanded');
              setPinToBottom(true);
              requestAnimationFrame(() => {
                const el = scrollRef.current;
                if (el) el.scrollTop = el.scrollHeight;
              });
            }}
            className="border border-green-500/30 text-green-300 hover:text-green-200 hover:border-green-400/50 rounded px-2 py-0.5 font-mono text-[10px] uppercase"
            title={mode === 'collapsed' ? 'Expand' : 'Collapse'}
          >
            {mode === 'collapsed' ? 'Expand' : 'Collapse'}
          </button>
          <button
            onClick={() => setMode('hidden')}
            className="border border-green-500/30 text-green-300 hover:text-green-200 hover:border-green-400/50 rounded px-2 py-0.5 font-mono text-[10px] uppercase"
            title="Hide telemetry"
          >
            Hide
          </button>
        </div>
      </div>
      {/* Scrollable history */}
      <div 
        ref={scrollRef}
        className={`matrix-text text-xs border border-green-500/20 rounded-md p-2 pr-3 ${heightClass} overflow-y-auto`}
        onScroll={(e) => {
          const el = e.currentTarget;
          const threshold = 16; // px
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
          setPinToBottom(atBottom);
        }}
      >
        {history.length === 0 ? (
          <div className="text-green-400">🔗 [STANDBY] Awaiting mission parameters...</div>
        ) : (
          history.map((log, idx) => {
            const style = getLogStyle(log.level);
            const ts = new Date(log.timestamp);
            const time = isNaN(ts.getTime()) ? '' : ts.toLocaleTimeString();
            return (
              <div key={`${ts.getTime()}-${idx}`} className={`mb-1 ${style.messageColor} whitespace-pre-wrap break-words`}>
                <span className="opacity-60">[{time}]</span>{' '}
                {style.icon} {log.message}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
