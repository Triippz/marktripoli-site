import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Profile } from '../../types/resume';
import { useMissionControl } from '../../store/missionControl';
import { missionAudio } from '../../utils/audioSystem';

interface SocialLink {
  network: string;
  url: string;
  username?: string;
  icon: string;
  label: string;
  description: string;
}

interface SocialLinksSectionProps {
  className?: string;
  showLabels?: boolean;
  variant?: 'horizontal' | 'vertical' | 'grid';
}

const SOCIAL_NETWORK_CONFIG: Record<string, Omit<SocialLink, 'url' | 'username'>> = {
  linkedin: {
    network: 'linkedin',
    icon: '💼',
    label: 'LINKEDIN',
    description: 'Professional Network Access'
  },
  github: {
    network: 'github',
    icon: '💻',
    label: 'GITHUB',
    description: 'Code Repository Terminal'
  },
  twitter: {
    network: 'twitter',
    icon: '🐦',
    label: 'TWITTER',
    description: 'Tactical Communications'
  },
  x: {
    network: 'x',
    icon: '✖️',
    label: 'X (TWITTER)',
    description: 'Tactical Communications'
  },
  email: {
    network: 'email',
    icon: '📧',
    label: 'ENCRYPTED EMAIL',
    description: 'Secure Communication Channel'
  },
  phone: {
    network: 'phone',
    icon: '📞',
    label: 'DIRECT LINE',
    description: 'Emergency Communication'
  },
  website: {
    network: 'website',
    icon: '🌐',
    label: 'WEB TERMINAL',
    description: 'Personal Command Center'
  },
  instagram: {
    network: 'instagram',
    icon: '📷',
    label: 'RECON PHOTOS',
    description: 'Visual Intelligence Feed'
  },
  youtube: {
    network: 'youtube',
    icon: '📹',
    label: 'VIDEO BRIEFINGS',
    description: 'Multimedia Intel Channel'
  }
};

// Fallback static contact data
const STATIC_CONTACTS: SocialLink[] = [
  {
    network: 'email',
    url: 'mailto:mark@picogrid.com',
    icon: '📧',
    label: 'ENCRYPTED EMAIL',
    description: 'Primary Secure Channel'
  },
  {
    network: 'phone',
    url: 'tel:+1-555-0123',
    icon: '📞',
    label: 'DIRECT LINE',
    description: 'Emergency Communications'
  }
];

export default function SocialLinksSection({ 
  className = '', 
  showLabels = true, 
  variant = 'horizontal' 
}: SocialLinksSectionProps) {
  const { addTelemetry } = useMissionControl();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [resumeDataState, setResumeDataState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const loadResumeData = async () => {
      setResumeDataState('loading');
      setIsLoading(true);
      
      try {
        const response = await fetch('/resume.json');
        if (!response.ok) {
          throw new Error(`Failed to load resume: ${response.status}`);
        }
        const data = await response.json();
        setResumeData(data);
        setResumeDataState('success');
        
        addTelemetry({
          source: 'COMMS',
          message: 'Resume data loaded successfully',
          level: 'success'
        });
      } catch (error) {
        console.error('[SocialLinksSection] Failed to load resume data:', error);
        setResumeDataState('error');
        addTelemetry({
          source: 'COMMS',
          message: `Resume data load failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          level: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadResumeData();
  }, []);

  useEffect(() => {
    const loadSocialLinks = () => {
      setIsLoading(true);
      
      try {
        const links: SocialLink[] = [];
        
        // Extract from resume data if available
        if (resumeData?.basics) {
          const { basics } = resumeData;
          
          // Add email from basics
          if (basics.email) {
            links.push({
              network: 'email',
              url: `mailto:${basics.email}`,
              username: basics.email,
              icon: SOCIAL_NETWORK_CONFIG.email.icon,
              label: SOCIAL_NETWORK_CONFIG.email.label,
              description: SOCIAL_NETWORK_CONFIG.email.description
            });
          }
          
          // Add phone from basics
          if (basics.phone) {
            links.push({
              network: 'phone',
              url: `tel:${basics.phone}`,
              username: basics.phone,
              icon: SOCIAL_NETWORK_CONFIG.phone.icon,
              label: SOCIAL_NETWORK_CONFIG.phone.label,
              description: SOCIAL_NETWORK_CONFIG.phone.description
            });
          }
          
          // Add website from basics
          if (basics.url) {
            links.push({
              network: 'website',
              url: basics.url,
              icon: SOCIAL_NETWORK_CONFIG.website.icon,
              label: SOCIAL_NETWORK_CONFIG.website.label,
              description: SOCIAL_NETWORK_CONFIG.website.description
            });
          }
          
          // Add social profiles
          if (basics.profiles && Array.isArray(basics.profiles)) {
            basics.profiles.forEach((profile: Profile) => {
              if (profile.network && profile.url) {
                const networkKey = profile.network.toLowerCase();
                const config = SOCIAL_NETWORK_CONFIG[networkKey];
                
                if (config) {
                  links.push({
                    network: profile.network,
                    url: profile.url,
                    username: profile.username,
                    icon: config.icon,
                    label: config.label,
                    description: config.description
                  });
                }
              }
            });
          }
        }
        
        // Use fallback static contacts if no resume data or no links found
        if (links.length === 0) {
          setSocialLinks(STATIC_CONTACTS);
          addTelemetry({
            source: 'COMMS',
            message: 'Using static contact channels - resume data unavailable',
            level: 'warning'
          });
        } else {
          setSocialLinks(links);
          addTelemetry({
            source: 'COMMS',
            message: `${links.length} communication channels loaded from resume data`,
            level: 'success'
          });
        }
      } catch (error) {
        console.warn('[SocialLinksSection] Error loading social links:', error);
        setSocialLinks(STATIC_CONTACTS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSocialLinks();
  }, [resumeData, resumeDataState]);

  const handleSocialLinkClick = async (link: SocialLink) => {
    await missionAudio.playEngagement();
    
    // Add telemetry for link click
    addTelemetry({
      source: 'COMMS',
      message: `Secure channel opened: ${link.label}`,
      level: 'info'
    });
    
    // Add small delay for audio feedback
    setTimeout(() => {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }, 200);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'vertical':
        return 'flex flex-col space-y-2';
      case 'grid':
        return 'grid grid-cols-2 md:grid-cols-3 gap-3';
      case 'horizontal':
      default:
        return 'flex flex-wrap gap-3';
    }
  };

  if (isLoading && resumeDataState === 'loading') {
    return (
      <div className={`social-links-section ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <div className="tactical-loading w-4 h-4"></div>
          <span className="text-green-500 text-xs font-mono">LOADING SECURE CHANNELS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`social-links-section ${className}`}>
      {/* Section Header */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-green-500 text-lg">📡</span>
        <div className="holo-text text-sm font-mono">
          COMMUNICATION CHANNELS
        </div>
        <div className="status-indicator ml-auto">
          <div className="status-dot active"></div>
          <span className="text-xs">ONLINE</span>
        </div>
      </div>

      {/* Error State */}
      {resumeDataState === 'error' && (
        <motion.div
          className="hud-panel border-yellow-500/50 p-3 mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500">⚠️</span>
            <span className="text-yellow-500 text-xs font-mono">
              RESUME DATA UNAVAILABLE - USING BACKUP CHANNELS
            </span>
          </div>
        </motion.div>
      )}

      {/* Social Links */}
      <div className={getVariantClasses()}>
        <AnimatePresence mode="popLayout">
          {socialLinks.map((link, index) => (
            <motion.button
              key={`${link.network}-${index}`}
              className="tactical-button p-3 group relative"
              onClick={() => handleSocialLinkClick(link)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{link.icon}</span>
                {showLabels && (
                  <div className="text-left">
                    <div className="text-sm font-mono text-green-400">
                      {link.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {link.description}
                    </div>
                    {link.username && (
                      <div className="text-xs font-mono text-gray-500 mt-1">
                        @{link.username}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Hover tooltip for minimal variants */}
              {!showLabels && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-200
                               bg-gray-900 border border-green-500/30 rounded px-2 py-1 z-10">
                  <div className="text-xs font-mono text-green-400 whitespace-nowrap">
                    {link.label}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                                 w-0 h-0 border-l-4 border-r-4 border-t-4 
                                 border-l-transparent border-r-transparent border-t-green-500/30">
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Data Source Indicator */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-green-500/20">
        <div className="text-xs font-mono text-gray-500">
          {resumeData ? 'DATA SOURCE: RESUME' : 'DATA SOURCE: BACKUP'}
        </div>
        <div className="text-xs font-mono text-gray-500">
          {socialLinks.length} CHANNEL{socialLinks.length !== 1 ? 'S' : ''} ACTIVE
        </div>
      </div>
    </div>
  );
}