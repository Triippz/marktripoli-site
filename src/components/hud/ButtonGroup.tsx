interface ButtonGroupProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  onContactClick?: () => void;
}

export default function ButtonGroup({ soundEnabled, toggleSound, onContactClick }: ButtonGroupProps) {
  return (
    <div className="flex items-center justify-end space-x-2">
      <button 
        className="tactical-button text-xs px-3 py-2 min-h-[44px]"
        onClick={toggleSound}
      >
        AUDIO: {soundEnabled ? 'ON' : 'OFF'}
      </button>
      <button 
        className="tactical-button text-xs px-3 py-2 min-h-[44px]"
        onClick={() => window.location.pathname === '/briefing' ? window.location.href = '/' : window.location.href = '/briefing'}
      >
        {window.location.pathname === '/briefing' ? 'MAP VIEW' : 'EXEC BRIEF'}
      </button>
      {onContactClick && (
        <button 
          className="tactical-button text-xs px-3 py-2 min-h-[44px]"
          onClick={onContactClick}
        >
          CONTACT
        </button>
      )}
    </div>
  );
}