import type { Profile } from '../../types/resume';
import { CollapsibleCard } from './CollapsibleCard';

interface TechnicalCraftSectionProps {
  profile: Profile | null;
}

export function TechnicalCraftSection({ profile }: TechnicalCraftSectionProps) {
  if (!profile?.technical_craft) {
    return null;
  }

  const { technical_craft } = profile;

  return (
    <CollapsibleCard title="Technical Craft" storageKey="technical-craft">
      <div className="mission-panel p-6 md:p-8">
        <div className="holo-text font-mono text-lg mb-4">{technical_craft.title}</div>
        {technical_craft.approach && (
          <div className="text-gray-300 text-sm mb-4 italic border-l-2 border-green-500/40 pl-4">
            {technical_craft.approach}
          </div>
        )}
        
        {/* Technical Domains */}
        {technical_craft.domains && technical_craft.domains.length > 0 && (
          <div className="mb-4">
            <div className="text-green-400 text-xs font-mono mb-2">Technical Domains:</div>
            <div className="flex flex-wrap gap-1">
              {technical_craft.domains.map((domain, index) => (
                <span 
                  key={index} 
                  className="border border-green-500/40 text-green-300 px-2 py-0.5 rounded text-[11px] font-mono"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Core Principles */}
        {technical_craft.principles && technical_craft.principles.length > 0 && (
          <div className="mb-4">
            <div className="text-green-400 text-xs font-mono mb-2">Core Principles:</div>
            <div className="space-y-2">
              {technical_craft.principles.map((principle, index) => (
                <div key={index} className="text-gray-400 text-sm flex items-start">
                  <span className="text-green-500 mr-3 font-mono">◆</span>
                  {principle}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Development Practices */}
        {technical_craft.practices && technical_craft.practices.length > 0 && (
          <div>
            <div className="text-green-400 text-xs font-mono mb-2">Development Practices:</div>
            <div className="space-y-2">
              {technical_craft.practices.map((practice, index) => (
                <div key={index} className="text-gray-400 text-sm flex items-start">
                  <span className="text-green-500 mr-3 font-mono">►</span>
                  {practice}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}