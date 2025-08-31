export default function StatusIndicators() {
  return (
    <div className="floating-card p-3">
      <div className="flex flex-col space-y-2 text-xs font-mono text-white">
        <div className="flex items-center justify-between min-w-[120px]">
          <span>STATUS:</span>
          <div className="flex items-center">
            <div className="status-dot active mr-1" />
            <span className="text-green-400">OPERATIONAL</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>LINK:</span>
          <div className="flex items-center">
            <div className="status-dot active mr-1" />
            <span className="text-green-400">SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
}