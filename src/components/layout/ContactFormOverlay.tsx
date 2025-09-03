import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

interface SocialLinksOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SocialLinksOverlay({ isOpen, onClose }: SocialLinksOverlayProps) {
  const { isMobile } = useResponsive();

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  const socialLinks = [
    {
      name: 'Twitter',
      icon: faTwitter,
      url: 'https://twitter.com/Triperoni',
      color: 'text-blue-400 hover:text-blue-300'
    },
    {
      name: 'LinkedIn',
      icon: faLinkedin,
      url: 'https://www.linkedin.com/in/mark-tripoli',
      color: 'text-blue-600 hover:text-blue-500'
    },
    {
      name: 'GitHub',
      icon: faGithub,
      url: 'https://github.com/Triippz',
      color: 'text-white hover:text-gray-300'
    },
    {
      name: 'Email',
      icon: faEnvelope,
      url: 'mailto:me@marktripoli.com',
      color: 'text-green-400 hover:text-green-300'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed bg-black bg-opacity-75 flex items-center justify-center z-[70] overflow-y-auto ${
            isMobile 
              ? 'inset-0 pt-20 pb-4 px-4' // Account for mobile navbar height
              : 'inset-0 p-4'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            // Only close if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <motion.div
            className={`mission-panel relative my-auto ${
              isMobile 
                ? 'w-[90vw] max-w-sm mx-auto p-6 max-h-[calc(100vh-6rem)] overflow-y-auto' 
                : 'max-w-md mx-4 p-8 max-h-[80vh] overflow-y-auto'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className={`absolute top-4 right-4 text-green-400 hover:text-green-300 transition-colors z-10 ${
                isMobile ? 'p-3 min-w-[44px] min-h-[44px] flex items-center justify-center' : 'p-2'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Close dialog"
            >
              <FontAwesomeIcon icon={faTimes} size={isMobile ? "xl" : "lg"} />
            </button>

            {/* Header */}
            <div className={`text-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <h2 className={`font-mono text-green-400 mb-2 mc-text-glow ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>
                ESTABLISH COMMS
              </h2>
              <p className="text-green-300 font-mono text-sm">
                Select communication channel:
              </p>
            </div>

            {/* Social Links Grid */}
            <div className={`grid gap-4 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    tactical-glass text-center rounded-lg transition-all duration-300
                    hover:border-green-400/50 hover:shadow-lg hover:shadow-green-400/20
                    ${link.color} ${isMobile ? 'p-6 min-h-[80px]' : 'p-4'}
                  `}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <FontAwesomeIcon 
                    icon={link.icon} 
                    size={isMobile ? "2x" : "2x"} 
                    className="mb-2" 
                  />
                  <div className={`font-mono uppercase tracking-wider ${
                    isMobile ? 'text-sm' : 'text-xs'
                  }`}>
                    {link.name}
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Footer */}
            <div className={`text-center text-green-400/70 font-mono text-xs ${
              isMobile ? 'mt-4' : 'mt-6'
            }`}>
              /// SECURE CHANNELS READY ///
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

