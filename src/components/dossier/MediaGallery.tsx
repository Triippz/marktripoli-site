import { motion } from 'framer-motion';
import type { SiteData } from '../../types/mission';

interface MediaGalleryProps {
  site: SiteData;
}

function MediaGallery({ site }: MediaGalleryProps) {
  if (!site.media || site.media.length === 0) {
    return (
      <div className="text-center text-mc-gray font-mono">
        No media files available for this mission.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="border-b border-mc-green/30 pb-4">
        <h2 className="text-xl font-mono text-mc-green">
          MEDIA GALLERY
        </h2>
        <p className="text-mc-gray text-sm font-mono mt-2">
          Visual documentation and supporting materials
        </p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {site.media.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="mc-terminal p-4"
          >
            {item.type === 'image' && (
              <div className="space-y-3">
                {/* Placeholder for image - in a real implementation you'd load the actual image */}
                <div className="w-full h-48 bg-mc-panel rounded flex items-center justify-center border-2 border-dashed border-mc-green/30">
                  <div className="text-center">
                    <div className="text-4xl text-mc-green mb-2">📸</div>
                    <div className="text-sm font-mono text-mc-gray">
                      IMAGE: {item.url.split('/').pop()}
                    </div>
                  </div>
                </div>
                {item.caption && (
                  <p className="text-sm text-mc-gray font-mono">
                    {item.caption}
                  </p>
                )}
              </div>
            )}

            {item.type === 'video' && (
              <div className="space-y-3">
                <div className="w-full h-48 bg-mc-panel rounded flex items-center justify-center border-2 border-dashed border-mc-green/30">
                  <div className="text-center">
                    <div className="text-4xl text-mc-green mb-2">🎥</div>
                    <div className="text-sm font-mono text-mc-gray">
                      VIDEO: {item.url.split('/').pop()}
                    </div>
                    <button className="mc-button mt-2 text-xs">
                      PLAY
                    </button>
                  </div>
                </div>
                {item.caption && (
                  <p className="text-sm text-mc-gray font-mono">
                    {item.caption}
                  </p>
                )}
              </div>
            )}

            {item.type === 'link' && (
              <div className="space-y-3">
                <div className="w-full h-32 bg-mc-panel rounded flex items-center justify-center border border-mc-green/30">
                  <div className="text-center">
                    <div className="text-2xl text-mc-green mb-2">🔗</div>
                    <div className="text-sm font-mono text-mc-gray">
                      EXTERNAL LINK
                    </div>
                  </div>
                </div>
                <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mc-button block text-center"
                >
                  ACCESS LINK
                </a>
                {item.caption && (
                  <p className="text-sm text-mc-gray font-mono">
                    {item.caption}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Media Stats */}
      <div className="pt-6 border-t border-mc-green/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-mono text-mc-green">
              {site.media.filter(m => m.type === 'image').length}
            </div>
            <div className="text-xs font-mono text-mc-gray">
              IMAGES
            </div>
          </div>
          <div>
            <div className="text-lg font-mono text-mc-green">
              {site.media.filter(m => m.type === 'video').length}
            </div>
            <div className="text-xs font-mono text-mc-gray">
              VIDEOS
            </div>
          </div>
          <div>
            <div className="text-lg font-mono text-mc-green">
              {site.media.filter(m => m.type === 'link').length}
            </div>
            <div className="text-xs font-mono text-mc-gray">
              LINKS
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MediaGallery;