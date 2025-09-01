export default function StatusIndicators() {

  return (
    <div className="tactical-panel relative overflow-hidden px-8 py-4">
      {/* Animated scan line */}
      <div className="animate-scan-line absolute top-0 left-0 right-0 h-full opacity-30" />
      
      {/* Main content */}
      <div className="relative z-10 flex items-center" style={{gap: '6rem'}}>
        {/* STATUS indicator */}
        <div className="flex items-center" style={{gap: '2rem'}}>
          <span className="holo-text text-sm font-bold tracking-wider">STATUS:</span>
          <div className="status-dot active" />
        </div>
        
        {/* Separator */}
        <div className="w-px h-6 bg-green-500/30" />
        
        {/* LINK indicator */}
        <div className="flex items-center" style={{gap: '2rem'}}>
          <span className="holo-text text-sm font-bold tracking-wider">LINK:</span>
          <div className="status-dot active" />
        </div>
        
        {/* Separator */}
        <div className="w-px h-6 bg-green-500/30" />
      </div>
      
      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60" />
    </div>
  );
}