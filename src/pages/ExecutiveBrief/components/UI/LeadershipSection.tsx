import type { Profile } from '../../types/resume';
import { CollapsibleCard } from './CollapsibleCard';

interface LeadershipSectionProps {
  profile: Profile | null;
}

export function LeadershipSection({ profile }: LeadershipSectionProps) {
  if (!profile?.leadership) {
    return null;
  }

  const { leadership } = profile;

  return (
    <CollapsibleCard title="Leadership" storageKey="leadership">
      <div className="space-y-6">
      {/* Leadership Philosophy */}
      {leadership.philosophy && (
        <div className="mission-panel p-6 md:p-8">
          <div className="holo-text font-mono text-lg mb-4">{leadership.philosophy.title}</div>
          {leadership.philosophy.approach && (
            <div className="text-gray-300 text-sm mb-4 italic border-l-2 border-green-500/40 pl-4">
              {leadership.philosophy.approach}
            </div>
          )}
          {leadership.philosophy.principles && leadership.philosophy.principles.length > 0 && (
            <div className="space-y-2">
              {leadership.philosophy.principles.map((principle, index) => (
                <div key={index} className="text-gray-400 text-sm flex items-start">
                  <span className="text-green-500 mr-3 font-mono">◆</span>
                  {principle}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mentorship */}
      {leadership.mentorship && (
        <div className="mission-panel p-6 md:p-8">
          <div className="holo-text font-mono text-lg mb-4">{leadership.mentorship.title}</div>
          {leadership.mentorship.approach && (
            <div className="text-gray-300 text-sm mb-4">
              {leadership.mentorship.approach}
            </div>
          )}
          {leadership.mentorship.methods && leadership.mentorship.methods.length > 0 && (
            <div className="space-y-2">
              {leadership.mentorship.methods.map((method, index) => (
                <div key={index} className="text-gray-400 text-sm flex items-start">
                  <span className="text-green-500 mr-3 font-mono">►</span>
                  {method}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Focus & Team Culture - Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Focus */}
        {leadership.product_focus && (
          <div className="mission-panel p-6 md:p-8">
            <div className="holo-text font-mono text-lg mb-4">{leadership.product_focus.title}</div>
            {leadership.product_focus.philosophy && (
              <div className="text-gray-300 text-sm mb-4 italic">
                {leadership.product_focus.philosophy}
              </div>
            )}
            {leadership.product_focus.practices && leadership.product_focus.practices.length > 0 && (
              <div className="space-y-2">
                {leadership.product_focus.practices.map((practice, index) => (
                  <div key={index} className="text-gray-400 text-xs flex items-start">
                    <span className="text-green-500 mr-2 font-mono">•</span>
                    {practice}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team Culture */}
        {leadership.team_culture && (
          <div className="mission-panel p-6 md:p-8">
            <div className="holo-text font-mono text-lg mb-4">{leadership.team_culture.title}</div>
            {leadership.team_culture.values && leadership.team_culture.values.length > 0 && (
              <div className="mb-4">
                <div className="text-green-400 text-xs font-mono mb-2">Core Values:</div>
                <div className="space-y-1">
                  {leadership.team_culture.values.map((value, index) => (
                    <div key={index} className="text-gray-400 text-xs flex items-start">
                      <span className="text-green-500 mr-2 font-mono">•</span>
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {leadership.team_culture.practices && leadership.team_culture.practices.length > 0 && (
              <div>
                <div className="text-green-400 text-xs font-mono mb-2">Key Practices:</div>
                <div className="space-y-1">
                  {leadership.team_culture.practices.map((practice, index) => (
                    <div key={index} className="text-gray-400 text-xs flex items-start">
                      <span className="text-green-500 mr-2 font-mono">►</span>
                      {practice}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Innovation */}
      {leadership.innovation && (
        <div className="mission-panel p-6 md:p-8">
          <div className="holo-text font-mono text-lg mb-4">{leadership.innovation.title}</div>
          {leadership.innovation.approach && (
            <div className="text-gray-300 text-sm mb-4">
              {leadership.innovation.approach}
            </div>
          )}
          {leadership.innovation.focus_areas && leadership.innovation.focus_areas.length > 0 && (
            <div className="space-y-2 mb-4">
              {leadership.innovation.focus_areas.map((area, index) => (
                <div key={index} className="text-gray-400 text-sm flex items-start">
                  <span className="text-green-500 mr-3 font-mono">◆</span>
                  {area}
                </div>
              ))}
            </div>
          )}
          {leadership.innovation.mindset && (
            <div className="text-gray-300 text-sm italic border-l-2 border-green-500/40 pl-4">
              {leadership.innovation.mindset}
            </div>
          )}
        </div>
      )}

      {/* People-First Leadership */}
      {leadership.people_leadership && (
        <div className="mission-panel p-6 md:p-8">
          <div className="holo-text font-mono text-lg mb-4">{leadership.people_leadership.title}</div>
          {leadership.people_leadership.approach && (
            <div className="text-gray-300 text-sm mb-4 italic border-l-2 border-green-500/40 pl-4">
              {leadership.people_leadership.approach}
            </div>
          )}
          {leadership.people_leadership.principles && leadership.people_leadership.principles.length > 0 && (
            <div className="mb-4">
              <div className="text-green-400 text-xs font-mono mb-2">Core Principles:</div>
              <div className="space-y-2">
                {leadership.people_leadership.principles.map((principle, index) => (
                  <div key={index} className="text-gray-400 text-sm flex items-start">
                    <span className="text-green-500 mr-3 font-mono">◆</span>
                    {principle}
                  </div>
                ))}
              </div>
            </div>
          )}
          {leadership.people_leadership.practices && leadership.people_leadership.practices.length > 0 && (
            <div>
              <div className="text-green-400 text-xs font-mono mb-2">Key Practices:</div>
              <div className="space-y-2">
                {leadership.people_leadership.practices.map((practice, index) => (
                  <div key={index} className="text-gray-400 text-sm flex items-start">
                    <span className="text-green-500 mr-3 font-mono">►</span>
                    {practice}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </CollapsibleCard>
  );
}