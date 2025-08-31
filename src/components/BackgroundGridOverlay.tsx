export default function BackgroundGridOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-5"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}
    />
  );
}

