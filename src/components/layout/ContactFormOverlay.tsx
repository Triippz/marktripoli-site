import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialLinksOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SocialLinksOverlay({ isOpen, onClose }: SocialLinksOverlayProps) {
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
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="mission-panel max-w-md mx-4 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-green-400 hover:text-green-300 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-mono text-green-400 mb-2 mc-text-glow">
                ESTABLISH COMMS
              </h2>
              <p className="text-green-300 font-mono text-sm">
                Select communication channel:
              </p>
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-2 gap-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    tactical-glass p-4 text-center rounded-lg transition-all duration-300
                    hover:border-green-400/50 hover:shadow-lg hover:shadow-green-400/20
                    ${link.color}
                  `}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={link.icon} size="2x" className="mb-2" />
                  <div className="font-mono text-xs uppercase tracking-wider">
                    {link.name}
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-green-400/70 font-mono text-xs">
              /// SECURE CHANNELS READY ///
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

