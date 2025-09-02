interface ScanlinesOverlayProps {
  active: boolean;
}

interface AlertOverlayProps {
  active: boolean;
}

export function ScanlinesOverlay({ active }: ScanlinesOverlayProps) {
  if (!active) return null;
  return <div className="scanlines-overlay" />;
}

export function AlertOverlay({ active }: AlertOverlayProps) {
  if (!active) return null;
  
  return (
    <>
      <div className="alert-overlay" />
      <div className="alert-banner">ALERT MODE — Unauthorized access detected</div>
    </>
  );
}