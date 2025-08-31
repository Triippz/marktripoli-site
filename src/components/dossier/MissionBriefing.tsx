import { motion } from 'framer-motion';
import type { SiteData } from '../../types/mission';

interface MissionBriefingProps {
  site: SiteData;
}

function MissionBriefing({ site }: MissionBriefingProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'ONGOING';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    }).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="border-b border-mc-green/30 pb-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-mono text-mc-green">
            {site.codename || site.name}
          </h2>
          <div className="text-right">
            <div className="text-sm font-mono text-mc-gray">
              CLASSIFICATION: {site.type.toUpperCase()}
            </div>
            {site.period && (
              <div className="text-sm font-mono text-mc-gray">
                {formatDate(site.period.start)} - {formatDate(site.period.end)}
              </div>
            )}
          </div>
        </div>
        <h3 className="text-xl text-mc-white font-mono">
          {site.name}
        </h3>
      </div>

      {/* Mission Briefing */}
      <div>
        <h4 className="text-mc-green font-mono text-sm mb-3">
          MISSION BRIEFING
        </h4>
        <p className="text-mc-white leading-relaxed">
          {site.briefing}
        </p>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-mc-green font-mono text-sm mb-2">
            HQ COORDINATES
          </h4>
          <div className="font-mono text-mc-white text-sm">
            <div>LAT: {site.hq.lat.toFixed(4)}°</div>
            <div>LNG: {site.hq.lng.toFixed(4)}°</div>
          </div>
        </div>

        {site.engagementType && (
          <div>
            <h4 className="text-mc-green font-mono text-sm mb-2">
              ENGAGEMENT PROTOCOL
            </h4>
            <div className="font-mono text-mc-white text-sm uppercase">
              {site.engagementType.replace('-', ' ')}
            </div>
          </div>
        )}
      </div>

      {/* External Links */}
      {site.links && site.links.length > 0 && (
        <div>
          <h4 className="text-mc-green font-mono text-sm mb-3">
            EXTERNAL RESOURCES
          </h4>
          <div className="space-y-2">
            {site.links.map((link, index) => (
              <motion.a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mc-button text-left w-fit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-2">
                  <span>🔗</span>
                  <span>{link.label}</span>
                  {link.type && (
                    <span className="text-xs text-mc-gray">
                      [{link.type.toUpperCase()}]
                    </span>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="pt-4 border-t border-mc-green/30">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-mc-green rounded-full animate-pulse"></div>
          <span className="font-mono text-sm text-mc-green">
            DOSSIER STATUS: ACTIVE
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default MissionBriefing;