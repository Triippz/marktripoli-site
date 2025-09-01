import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { TelemetryEntry } from '../../types';

interface LiveTelemetryProps {
  telemetryLogs: TelemetryEntry[];
}

export default function LiveTelemetry({ telemetryLogs }: LiveTelemetryProps) {
  // Internal history buffer so the card keeps prior messages locally
  const [history, setHistory] = useState<TelemetryEntry[]>(telemetryLogs || []);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [pinToBottom, setPinToBottom] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
  const heightClass = isCollapsed ? 'h-24' : 'h-48';

  return (
    <motion.div 
      className="floating-card"
      style={{ 
        position: 'fixed', 
        bottom: '1rem', 
        right: '1rem', 
        zIndex: 60 
      }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9 }}
    >
      <div className="flex items-center mb-2">
        <div className={`w-2 h-2 ${logStyle.indicatorColor} rounded-full animate-pulse mr-2`} />
        <span className={`${logStyle.textColor} font-mono text-xs uppercase`}>
          Live Telemetry
        </span>
        {latestLog?.level === 'error' && (
          <span className="text-red-500 ml-1 animate-pulse">●</span>
        )}
        <div className="ml-auto flex items-center gap-2">
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
              setIsCollapsed(v => !v);
              setPinToBottom(true);
              requestAnimationFrame(() => {
                const el = scrollRef.current;
                if (el) el.scrollTop = el.scrollHeight;
              });
            }}
            className="border border-green-500/30 text-green-300 hover:text-green-200 hover:border-green-400/50 rounded px-2 py-0.5 font-mono text-[10px] uppercase"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
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
