import React from 'react';

interface AlertOverlayProps {
  isAlertMode: boolean;
}

const AlertOverlay: React.FC<AlertOverlayProps> = ({ isAlertMode }) => {
  if (!isAlertMode) return null;

  return (
    <>
      {/* Alert overlay background */}
      <div className="alert-overlay" />
      
      {/* Alert banner */}
      <div className="alert-banner">
        ALERT MODE — Unauthorized access detected
      </div>
    </>
  );
};

export default React.memo(AlertOverlay);
