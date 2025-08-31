import { useEffect } from 'react';
import { useMissionControl } from '../../store/missionControl';
import type { SiteData } from '../../types/mission';
import MissionBriefing from './MissionBriefing';
import DeploymentLogs from './DeploymentLogs';
import AfterActionReport from './AfterActionReport';
import MediaGallery from './MediaGallery';
import K9CompanionLogs from '../sideMissions/K9CompanionLogs';
import ElectronicsLab from '../sideMissions/ElectronicsLab';
import GamingTerminal from '../sideMissions/GamingTerminal';

interface DossierProps {
  site: SiteData;
}

function Dossier({ site }: DossierProps) {
  const { activeTab, setActiveTab, visitSite } = useMissionControl();

  // Mark site as visited when dossier is accessed
  useEffect(() => {
    visitSite(site.id);
  }, [site.id, visitSite]);

  const getHobbySpecificTabs = () => {
    if (site.id === 'k9') {
      return [{ id: 'k9_logs', label: 'K9 LOGS', component: K9CompanionLogs }];
    }
    if (site.id === 'electronics') {
      return [{ id: 'lab', label: 'LAB', component: ElectronicsLab }];
    }
    if (site.id === 'gaming') {
      return [{ id: 'gaming', label: 'GAMING', component: GamingTerminal }];
    }
    return [];
  };

  const tabs = [
    { id: 'briefing', label: 'BRIEFING', component: MissionBriefing },
    { id: 'logs', label: 'LOGS', component: DeploymentLogs },
    ...getHobbySpecificTabs(),
    ...(site.afterAction && site.afterAction.length > 0 
      ? [{ id: 'aar', label: 'AAR', component: AfterActionReport }] 
      : []
    ),
    ...(site.media && site.media.length > 0 
      ? [{ id: 'media', label: 'MEDIA', component: MediaGallery }] 
      : []
    )
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MissionBriefing;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-mc-green/30 px-4 pt-4">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                px-4 py-2 font-mono text-sm transition-colors
                ${activeTab === tab.id
                  ? 'text-mc-green border-b-2 border-mc-green bg-mc-green/10'
                  : 'text-mc-gray hover:text-mc-white hover:bg-mc-panel'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <ActiveComponent site={site} />
      </div>
    </div>
  );
}

export default Dossier;