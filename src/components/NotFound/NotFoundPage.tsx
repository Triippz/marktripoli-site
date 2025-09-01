import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Generate mission ID similar to error boundary
  const missionId = `NAV-${Date.now().toString(36).toUpperCase()}`;
  
  const handleReturnToBase = () => {
    navigate('/');
  };

  const handleScanArea = () => {
    navigate('/briefing');
  };

  return (
    <div className="min-h-screen bg-black flex items-start justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="tactical-404-display">
          {/* Header */}
          <div className="nav-header">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="radar-icon"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  📡
                </motion.div>
                <div>
                  <h1 className="nav-title">
                    MISSION NOT FOUND
                  </h1>
                  <p className="nav-subtitle">
                    Coordinates Invalid - Target Not Acquired
                  </p>
                </div>
              </div>
              <div className="mission-id">
                MISSION: {missionId}
              </div>
            </div>
          </div>

          {/* Navigation Details Grid */}
          <div className="nav-details-grid">
            {/* Navigation Status Panel */}
            <div className="nav-panel primary">
              <div className="panel-header">
                <span className="panel-title">NAVIGATION STATUS</span>
                <span className="panel-status invalid">COORDINATES INVALID</span>
              </div>
              <div className="panel-content">
                <div className="nav-field">
                  <span className="field-label">REQUESTED:</span>
                  <span className="field-value break-all">{location.pathname}</span>
                </div>
                <div className="nav-field">
                  <span className="field-label">STATUS:</span>
                  <span className="field-value">TARGET NOT FOUND</span>
                </div>
                <div className="nav-field">
                  <span className="field-label">SCAN TIME:</span>
                  <span className="field-value">{new Date().toISOString()}</span>
                </div>
                <div className="nav-field">
                  <span className="field-label">MISSION ID:</span>
                  <span className="field-value">{missionId}</span>
                </div>
              </div>
            </div>

            {/* Available Coordinates Panel */}
            <div className="nav-panel secondary">
              <div className="panel-header">
                <span className="panel-title">AVAILABLE COORDINATES</span>
                <span className="panel-status active">OPERATIONAL</span>
              </div>
              <div className="panel-content">
                <div className="nav-field">
                  <span className="field-label">BASE:</span>
                  <span className="field-value">/</span>
                </div>
                <div className="nav-field">
                  <span className="field-label">BRIEFING:</span>
                  <span className="field-value">/briefing</span>
                </div>
                <div className="nav-field">
                  <span className="field-label">STATUS:</span>
                  <span className="field-value">All systems operational</span>
                </div>
                <div className="nav-field">
                  <span className="field-label">PROTOCOL:</span>
                  <span className="field-value">Return to base recommended</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="nav-actions">
            <button
              onClick={handleReturnToBase}
              className="tactical-button primary"
            >
              <span className="mr-2">🏠</span>
              RETURN TO BASE
            </button>
            
            <button
              onClick={handleScanArea}
              className="tactical-button secondary"
            >
              <span className="mr-2">🎯</span>
              SCAN BRIEFING AREA
            </button>
          </div>

          {/* Navigation Instructions */}
          <div className="nav-instructions">
            <div className="instructions-header">
              <span className="instructions-title">NAVIGATION PROTOCOL</span>
            </div>
            <div className="instructions-content">
              <div className="instruction-category">
                <h4>IMMEDIATE ACTIONS:</h4>
                <ul>
                  <li>Verify target coordinates and retry navigation</li>
                  <li>Return to Mission Control base for reorientation</li>
                  <li>Access executive briefing for mission overview</li>
                  <li>Contact mission support if coordinates should exist</li>
                </ul>
              </div>
              
              <div className="instruction-category">
                <h4>KEYBOARD SHORTCUTS:</h4>
                <ul>
                  <li><kbd>ESC</kbd> or <kbd>M</kbd> - Return to Mission Control</li>
                  <li><kbd>B</kbd> - Access Executive Briefing</li>
                  <li><kbd>Ctrl/Cmd + B</kbd> - Quick briefing access</li>
                </ul>
              </div>
              
              <div className="instruction-category">
                <h4>MISSION SUPPORT:</h4>
                <ul>
                  <li>Mission ID: <code className="mission-id-code">{missionId}</code></li>
                  <li>Report navigation errors to mission command</li>
                  <li>All valid coordinates are accessible from base</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .tactical-404-display {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          border: 2px solid #ffaa00;
          border-radius: 8px;
          padding: 2rem;
          color: #00ff41;
          font-family: 'Courier New', monospace;
          box-shadow: 
            0 0 30px rgba(255, 170, 0, 0.3),
            inset 0 0 30px rgba(0, 0, 0, 0.5);
        }

        .nav-header {
          border-bottom: 1px solid rgba(255, 170, 0, 0.3);
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
        }

        .radar-icon {
          font-size: 3rem;
          color: #ffaa00;
          text-shadow: 0 0 20px rgba(255, 170, 0, 0.7);
        }

        .nav-title {
          font-size: 2rem;
          font-weight: bold;
          color: #ffaa00;
          margin: 0;
          text-shadow: 0 0 10px rgba(255, 170, 0, 0.5);
          letter-spacing: 2px;
        }

        .nav-subtitle {
          font-size: 1rem;
          color: #cccccc;
          margin: 0.5rem 0 0 0;
          letter-spacing: 1px;
        }

        .mission-id {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          color: #00ff41;
          background: rgba(0, 255, 65, 0.1);
          padding: 0.5rem 1rem;
          border: 1px solid rgba(0, 255, 65, 0.3);
          border-radius: 4px;
        }

        .nav-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .nav-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .nav-panel {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid;
          border-radius: 6px;
          overflow: hidden;
        }

        .nav-panel.primary {
          border-color: #ffaa00;
        }

        .nav-panel.secondary {
          border-color: #00ff41;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: bold;
        }

        .panel-title {
          color: #00ff41;
          font-size: 0.9rem;
          letter-spacing: 1px;
        }

        .panel-status {
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          font-weight: bold;
        }

        .panel-status.invalid {
          background: rgba(255, 170, 0, 0.2);
          color: #ffaa00;
        }

        .panel-status.active {
          background: rgba(0, 255, 65, 0.2);
          color: #00ff41;
        }

        .panel-content {
          padding: 1rem;
        }

        .nav-field {
          display: flex;
          margin-bottom: 0.75rem;
          gap: 1rem;
        }

        .field-label {
          color: #ffaa00;
          font-weight: bold;
          min-width: 100px;
          font-size: 0.9rem;
        }

        .field-value {
          color: #ffffff;
          flex: 1;
          font-size: 0.9rem;
        }

        .nav-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .tactical-button {
          padding: 1rem 2rem;
          border: 2px solid;
          border-radius: 6px;
          background: transparent;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          min-width: 200px;
        }

        .tactical-button.primary {
          color: #00ff41;
          border-color: #00ff41;
        }

        .tactical-button.primary:hover {
          background: #00ff41;
          color: #000;
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
        }

        .tactical-button.secondary {
          color: #ffaa00;
          border-color: #ffaa00;
        }

        .tactical-button.secondary:hover {
          background: #ffaa00;
          color: #000;
          box-shadow: 0 0 20px rgba(255, 170, 0, 0.5);
        }

        .nav-instructions {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1.5rem;
        }

        .instructions-header {
          margin-bottom: 1rem;
        }

        .instructions-title {
          color: #00ff41;
          font-size: 1.1rem;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .instructions-content {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 1024px) {
          .instructions-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .instruction-category h4 {
          color: #ffaa00;
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }

        .instruction-category ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #ccc;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .instruction-category li {
          margin: 0.5rem 0;
        }

        .instruction-category kbd {
          background: rgba(0, 255, 65, 0.2);
          color: #00ff41;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          border: 1px solid rgba(0, 255, 65, 0.3);
        }

        .mission-id-code {
          background: rgba(0, 255, 65, 0.2);
          color: #00ff41;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          border: 1px solid rgba(0, 255, 65, 0.3);
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;