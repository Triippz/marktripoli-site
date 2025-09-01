import React from 'react';
import { useDataStore } from '../../store/missionControlV2';
import { ResumeDataLoader } from '../LoadingStates/ResumeDataLoader';
import { ResumeDataErrorBoundary } from '../ErrorBoundary/ResumeDataErrorBoundary';

/**
 * Example component demonstrating comprehensive resume data integration
 * Shows loading states, error handling, and data visualization
 */
export function ResumeIntegrationExample() {
  // Local resume URL (served from public/)
  const RESUME_URL = '/resume.json';
  
  const {
    sites,
    resumeData,
    resumeDataState,
    resumeDataError,
    lastResumeUpdate,
    loadResumeData,
    refreshResumeData,
    clearResumeData,
    getWorkSites,
    getProjectSites,
    getHobbySites
  } = useDataStore();

  const workSites = getWorkSites();
  const projectSites = getProjectSites();
  const hobbySites = getHobbySites();

  const handleLoadResume = () => {
    loadResumeData(RESUME_URL).catch(error => {
      console.error('Failed to load resume:', error);
    });
  };

  const handleRefresh = () => {
    refreshResumeData().catch(error => {
      console.error('Failed to refresh resume:', error);
    });
  };

  const handleClear = () => {
    clearResumeData();
  };

  return (
    <div className="resume-integration-example">
      <ResumeDataErrorBoundary>
        <div className="control-panel">
          <h2>Mission Control Resume Data Integration</h2>
          
          <div className="status-display">
            <div className="status-item">
              <span className="label">DATA STATUS:</span>
              <span className={`value status-${resumeDataState}`}>
                {resumeDataState.toUpperCase()}
              </span>
            </div>
            
            {lastResumeUpdate && (
              <div className="status-item">
                <span className="label">LAST UPDATE:</span>
                <span className="value">
                  {lastResumeUpdate.toLocaleString()}
                </span>
              </div>
            )}
            
            <div className="status-item">
              <span className="label">MISSION SITES:</span>
              <span className="value">{sites.length} TOTAL</span>
            </div>
          </div>

          <div className="action-buttons">
            <button onClick={handleLoadResume} disabled={resumeDataState === 'loading'}>
              LOAD RESUME DATA
            </button>
            <button onClick={handleRefresh} disabled={!resumeData}>
              REFRESH DATA
            </button>
            <button onClick={handleClear}>
              CLEAR CACHE
            </button>
          </div>

          {resumeDataError && (
            <div className="error-display">
              <strong>ERROR:</strong> {resumeDataError.message}
            </div>
          )}
        </div>

        <ResumeDataLoader 
          resumeUrl={RESUME_URL}
          autoLoad={false}
        >
          <div className="data-visualization">
            <div className="site-categories">
              <div className="category">
                <h3>WORK EXPERIENCE ({workSites.length})</h3>
                <div className="site-grid">
                  {workSites.map(site => (
                    <SiteCard key={site.id} site={site} />
                  ))}
                </div>
              </div>

              <div className="category">
                <h3>PROJECTS ({projectSites.length})</h3>
                <div className="site-grid">
                  {projectSites.map(site => (
                    <SiteCard key={site.id} site={site} />
                  ))}
                </div>
              </div>

              <div className="category">
                <h3>HOBBIES ({hobbySites.length})</h3>
                <div className="site-grid">
                  {hobbySites.map(site => (
                    <SiteCard key={site.id} site={site} />
                  ))}
                </div>
              </div>
            </div>

            {resumeData && (
              <div className="raw-data-section">
                <details>
                  <summary>Raw Resume Data</summary>
                  <pre className="json-display">
                    {JSON.stringify(resumeData, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </ResumeDataLoader>
      </ResumeDataErrorBoundary>

      <style jsx>{`
        .resume-integration-example {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #00ff41;
          font-family: 'Courier New', monospace;
          min-height: 100vh;
        }

        .control-panel {
          background: rgba(0, 255, 65, 0.1);
          border: 2px solid #00ff41;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .control-panel h2 {
          color: #00ff41;
          text-align: center;
          margin-bottom: 2rem;
          text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
          letter-spacing: 2px;
        }

        .status-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #333;
          border-radius: 4px;
        }

        .label {
          color: #ffaa00;
          font-weight: bold;
        }

        .value {
          color: #ffffff;
        }

        .status-idle { color: #888; }
        .status-loading { color: #ffaa00; }
        .status-loaded { color: #00ff41; }
        .status-error { color: #ff4444; }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .action-buttons button {
          padding: 0.75rem 2rem;
          border: 2px solid #00ff41;
          border-radius: 4px;
          background: transparent;
          color: #00ff41;
          font-family: inherit;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }

        .action-buttons button:hover:not(:disabled) {
          background: #00ff41;
          color: #000;
          box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
        }

        .action-buttons button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-display {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #ff4444;
          border-radius: 4px;
          color: #ff4444;
        }

        .data-visualization {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          border-radius: 8px;
          padding: 2rem;
        }

        .category {
          margin-bottom: 3rem;
        }

        .category h3 {
          color: #ffaa00;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 1.3rem;
          letter-spacing: 1px;
        }

        .site-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .raw-data-section {
          margin-top: 2rem;
          border-top: 1px solid #333;
          padding-top: 2rem;
        }

        .raw-data-section details {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #555;
          border-radius: 4px;
          padding: 1rem;
        }

        .raw-data-section summary {
          color: #ffaa00;
          cursor: pointer;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .json-display {
          background: #000;
          color: #00ff41;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.8rem;
          line-height: 1.4;
          max-height: 400px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

/**
 * Individual site card component
 */
function SiteCard({ site }: { site: any }) {
  return (
    <div className="site-card">
      <div className="card-header">
        <h4 className="site-name">{site.name}</h4>
        <span className="site-codename">{site.codename}</span>
      </div>
      
      <div className="card-body">
        <div className="coordinates">
          LAT: {site.hq.lat.toFixed(4)}, LNG: {site.hq.lng.toFixed(4)}
        </div>
        
        {site.period && (
          <div className="period">
            {site.period.start} - {site.period.end || 'PRESENT'}
          </div>
        )}
        
        <p className="briefing">{site.briefing}</p>
        
        {site.deploymentLogs && (
          <div className="logs">
            <strong>DEPLOYMENT LOGS:</strong>
            <ul>
              {site.deploymentLogs.slice(0, 2).map((log: string, index: number) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        .site-card {
          background: rgba(0, 255, 65, 0.1);
          border: 1px solid #00ff41;
          border-radius: 6px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .site-card:hover {
          box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
          transform: translateY(-2px);
        }

        .card-header {
          margin-bottom: 1rem;
        }

        .site-name {
          color: #ffffff;
          font-size: 1.1rem;
          font-weight: bold;
          margin: 0 0 0.5rem 0;
        }

        .site-codename {
          color: #ffaa00;
          font-size: 0.9rem;
          font-weight: bold;
          background: rgba(255, 170, 0, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
        }

        .card-body {
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .coordinates {
          color: #888;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
          font-family: monospace;
        }

        .period {
          color: #00ff41;
          font-weight: bold;
          margin-bottom: 1rem;
          font-size: 0.85rem;
        }

        .briefing {
          color: #cccccc;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .logs {
          font-size: 0.8rem;
        }

        .logs strong {
          color: #ffaa00;
          display: block;
          margin-bottom: 0.5rem;
        }

        .logs ul {
          margin: 0;
          padding-left: 1rem;
          color: #cccccc;
        }

        .logs li {
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  );
}
