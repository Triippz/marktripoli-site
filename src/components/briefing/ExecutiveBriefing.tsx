import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMissionControl } from '../../store/missionControl';
import { useDataStore } from '../../store/missionControlV2';
// import { transformResumeToMissionControlData, generateExecutiveBriefing } from '../../services/resumeDataTransformer';
import sitesData from '../../data/sites.json';
import BackendEngineerDisclaimer from '../BackendEngineerDisclaimer';
// TODO: Add react-helmet-async for SEO metadata
// import { Helmet } from 'react-helmet-async';

function ExecutiveBriefing() {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<'overview' | 'experience' | 'skills' | 'projects' | 'contact'>('overview');
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { unlockEasterEgg } = useMissionControl();
  // const { sites } = useDataStore(); // TODO: Implement dynamic sites in briefing

  // Load resume data and unlock easter egg
  useEffect(() => {
    unlockEasterEgg('executive_briefing');
    
    // Show disclaimer if not dismissed before
    const disclaimerDismissed = localStorage.getItem('backend-disclaimer-dismissed');
    if (!disclaimerDismissed) {
      setShowDisclaimer(true);
    }
    
    // Try to load resume data (fallback to static if not available)
    setLoadingResume(true);
    try {
      // Use static sites data as fallback
      const staticData = {
        sites: sitesData,
        executiveBriefing: {
          name: 'Mark Tripoli',
          title: 'Engineering Manager & Technical Lead',
          location: 'Los Angeles, CA',
          summary: 'Technical leader with expertise in C2 systems, data integration, and platform engineering.',
          contact: {
            email: 'mark@picogrid.com',
            linkedin: 'https://linkedin.com/in/marktripoli',
            github: 'https://github.com/tripolipg'
          }
        }
      };
      setResumeData(staticData);
    } catch (error) {
      console.warn('Failed to load resume data, using fallback');
    } finally {
      setLoadingResume(false);
    }
  }, [unlockEasterEgg]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        // Already on briefing page
      } else if (event.key === 'b' && !event.target || (event.target as HTMLElement)?.tagName !== 'INPUT') {
        event.preventDefault();
        // Already on briefing page
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const sections = [
    { id: 'overview', label: 'EXECUTIVE SUMMARY', icon: '🎯' },
    { id: 'experience', label: 'MISSION HISTORY', icon: '🎖️' },
    { id: 'skills', label: 'CAPABILITIES MATRIX', icon: '⚙️' },
    { id: 'projects', label: 'KEY OPERATIONS', icon: '🚀' },
    { id: 'contact', label: 'SECURE COMMS', icon: '📡' }
  ] as const;

  const handlePDFExport = useCallback(() => {
    setShowPDFExport(true);
    // In a real implementation, this would generate and download a PDF
    setTimeout(() => {
      setShowPDFExport(false);
      // Trigger browser print dialog with print-optimized styles
      window.print();
    }, 1500);
  }, []);

  const handleJSONExport = useCallback(() => {
    const jsonData = {
      name: resumeData?.executiveBriefing?.name || 'Mark Tripoli',
      label: 'Engineering Manager & Technical Lead',
      email: resumeData?.executiveBriefing?.contact?.email || 'mark@picogrid.com',
      location: { city: 'Los Angeles', region: 'CA' },
      profiles: [
        { network: 'LinkedIn', url: resumeData?.executiveBriefing?.contact?.linkedin },
        { network: 'GitHub', url: resumeData?.executiveBriefing?.contact?.github }
      ].filter(p => p.url),
      work: resumeData?.sites?.filter((s: any) => s.type === 'job')?.map((site: any) => ({
        name: site.name,
        position: site.briefing?.split(' ')[0] || 'Senior Engineer',
        startDate: site.period?.start,
        endDate: site.period?.end,
        summary: site.briefing,
        highlights: site.deploymentLogs
      })) || []
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mark-tripoli-resume.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [resumeData]);

  const handleVCardExport = useCallback(() => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Mark Tripoli
ORG:Picogrid
TITLE:Engineering Manager
EMAIL:mark@picogrid.com
URL:https://linkedin.com/in/marktripoli
END:VCARD`;
    
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mark-tripoli.vcf';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  if (loadingResume) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-green-500">LOADING EXECUTIVE BRIEFING...</p>
        </div>
      </div>
    );
  }

  const jobSites = resumeData?.sites?.filter((s: any) => s.type === 'job') || sitesData.filter(s => s.type === 'job');
  const hobbySites = resumeData?.sites?.filter((s: any) => s.type === 'hobby') || sitesData.filter(s => s.type === 'hobby');
  const projectSites = resumeData?.sites?.filter((s: any) => s.type === 'project') || sitesData.filter(s => s.type === 'project');

  // Set document title and meta tags manually for now
  useEffect(() => {
    document.title = 'Mark Tripoli - Executive Briefing | Engineering Leadership & Technical Strategy';
    
    // Update meta description if it exists
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Senior Engineering Manager with 15+ years experience in C2 systems, data integration, and platform engineering. Led teams at HubSpot, Picogrid, and defense contractors.'
      );
    }
  }, []);

  const handleDisclaimerClose = () => {
    setShowDisclaimer(false);
    localStorage.setItem('backend-disclaimer-dismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono print:bg-white print:text-black">
      <BackendEngineerDisclaimer 
        isOpen={showDisclaimer}
        onClose={handleDisclaimerClose}
      />
      
      {/* Top Bar with Contact Info */}
      <div className="border-b border-green-500/30 p-6 print:p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div>
              <h1 className="text-2xl font-bold text-green-500 mb-1 print:text-black">
                {resumeData?.executiveBriefing?.name || 'MARK TRIPOLI'}
              </h1>
              <p className="text-gray-300 text-sm print:text-gray-600">
                {resumeData?.executiveBriefing?.title || 'ENGINEERING MANAGER & TECHNICAL LEAD'}
              </p>
              <p className="text-gray-400 text-xs print:text-gray-500">
                📍 {resumeData?.executiveBriefing?.location || 'Los Angeles, CA'}
              </p>
            </div>
            
            {/* Contact Buttons */}
            <div className="flex items-center space-x-3 print:hidden">
              <a href={`mailto:${resumeData?.executiveBriefing?.contact?.email || 'mark@picogrid.com'}`} 
                 className="bg-gray-800 border border-green-500/50 text-green-500 px-3 py-1 text-xs rounded hover:bg-green-500/10 transition-colors">
                📧 EMAIL
              </a>
              {resumeData?.executiveBriefing?.contact?.linkedin && (
                <a href={resumeData.executiveBriefing.contact.linkedin} target="_blank" rel="noopener noreferrer"
                   className="bg-gray-800 border border-green-500/50 text-green-500 px-3 py-1 text-xs rounded hover:bg-green-500/10 transition-colors">
                  💼 LINKEDIN
                </a>
              )}
              {resumeData?.executiveBriefing?.contact?.github && (
                <a href={resumeData.executiveBriefing.contact.github} target="_blank" rel="noopener noreferrer"
                   className="bg-gray-800 border border-green-500/50 text-green-500 px-3 py-1 text-xs rounded hover:bg-green-500/10 transition-colors">
                  🐙 GITHUB
                </a>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3 print:hidden">
            <motion.button
              onClick={() => navigate('/')}
              className="bg-gray-800 border border-green-500/50 text-green-500 px-4 py-2 rounded hover:bg-green-500/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← BACK TO MAP
            </motion.button>
            
            {/* Download Menu */}
            <div className="relative group">
              <button className="bg-gray-800 border border-green-500/50 text-green-500 px-4 py-2 rounded hover:bg-green-500/10 transition-colors">
                DOWNLOAD ↓
              </button>
              <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-green-500/50 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button onClick={handlePDFExport} className="block w-full text-left px-4 py-2 text-green-500 hover:bg-green-500/10 text-sm">
                  📄 PDF Resume
                </button>
                <button onClick={handleJSONExport} className="block w-full text-left px-4 py-2 text-green-500 hover:bg-green-500/10 text-sm">
                  📊 JSON Resume
                </button>
                <button onClick={handleVCardExport} className="block w-full text-left px-4 py-2 text-green-500 hover:bg-green-500/10 text-sm">
                  📇 vCard
                </button>
              </div>
            </div>
            
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Navigation Sidebar */}
        <div className="w-64 border-r border-green-500/30 p-6 print:hidden">
          <nav className="space-y-2">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selectedSection === section.id
                    ? 'bg-green-500/20 border-green-500 text-green-500'
                    : 'border-gray-700 text-gray-400 hover:border-green-500/50 hover:text-green-400'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{section.icon}</span>
                  <span className="text-sm">{section.label}</span>
                </div>
              </motion.button>
            ))}
          </nav>

          {/* Key Metrics */}
          <div className="mt-8 p-4 bg-gray-900/50 rounded border border-gray-700">
            <h4 className="text-green-500 text-sm mb-3">MISSION METRICS</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Experience:</span>
                <span className="text-white">15+ years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Team Leadership:</span>
                <span className="text-white">25+ engineers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mission Sites:</span>
                <span className="text-white">{jobSites.length} active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Clearance Level:</span>
                <span className="text-white">SECRET</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Impact:</span>
                <span className="text-white">$50M+</span>
              </div>
            </div>
          </div>

          {/* Quick Access Keyboard Shortcuts */}
          <div className="mt-6 p-3 bg-gray-900/30 rounded border border-gray-700/50">
            <h5 className="text-green-500/70 text-xs mb-2">SHORTCUTS</h5>
            <div className="space-y-1 text-xs text-gray-500">
              <div>B - Return to briefing</div>
              <div>Cmd/Ctrl+B - Same</div>
              <div>Cmd/Ctrl+P - Print/PDF</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 print:w-full print:p-0">
          <motion.div
            key={selectedSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {selectedSection === 'overview' && (
              <div className="space-y-6 print:space-y-4">
                {/* Hero Summary with Key Metrics */}
                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30 print:bg-transparent print:border-gray-300">
                  <h2 className="text-xl text-green-500 mb-4 print:text-black">MISSION COMMANDER PROFILE</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-gray-300 leading-relaxed mb-4 print:text-black">
                        {resumeData?.executiveBriefing?.summary || 
                         'Senior Engineering Leader with 15+ years of experience architecting and delivering enterprise-scale solutions. Proven track record of building and leading high-performing engineering teams, driving technical strategy, and delivering mission-critical systems that generate significant revenue impact. Combines deep technical expertise with strategic business acumen and military-grade operational discipline.'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-green-500/10 p-3 rounded border border-green-500/30 print:border-gray-300">
                          <div className="text-green-400 text-sm font-bold print:text-gray-600">COMMAND EXPERIENCE</div>
                          <div className="text-white text-lg print:text-black">15+ years</div>
                        </div>
                        <div className="bg-green-500/10 p-3 rounded border border-green-500/30 print:border-gray-300">
                          <div className="text-green-400 text-sm font-bold print:text-gray-600">TEAM SIZE LED</div>
                          <div className="text-white text-lg print:text-black">25+ engineers</div>
                        </div>
                        <div className="bg-green-500/10 p-3 rounded border border-green-500/30 print:border-gray-300">
                          <div className="text-green-400 text-sm font-bold print:text-gray-600">REVENUE IMPACT</div>
                          <div className="text-white text-lg print:text-black">$50M+</div>
                        </div>
                        <div className="bg-green-500/10 p-3 rounded border border-green-500/30 print:border-gray-300">
                          <div className="text-green-400 text-sm font-bold print:text-gray-600">UPTIME ACHIEVED</div>
                          <div className="text-white text-lg print:text-black">99.9%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold mb-3 print:text-black">Core Capabilities</h3>
                      <ul className="text-gray-300 space-y-2 text-sm print:text-black">
                        <li>• C2 Systems Architecture & Integration</li>
                        <li>• Platform Engineering & DevOps</li>
                        <li>• Team Leadership & Scaling (2-25 engineers)</li>
                        <li>• IL-5/IL-6 Compliance & Security</li>
                        <li>• Microservices & Event-Driven Design</li>
                        <li>• Revenue-Generating Product Strategy</li>
                        <li>• Cross-Functional Leadership</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Hobbies Strip */}
                <div className="bg-gray-900/50 p-4 rounded border border-green-500/30 print:bg-transparent print:border-gray-300">
                  <h2 className="text-lg text-green-500 mb-3 print:text-black">AUXILIARY OPERATIONS</h2>
                  <div className="flex flex-wrap gap-4">
                    {hobbySites.map((hobby: any) => (
                      <div key={hobby.id} className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded border border-gray-700 print:bg-gray-100 print:border-gray-300">
                        <span className="text-lg">{hobby.icon}</span>
                        <span className="text-gray-300 text-sm print:text-black">{hobby.name}</span>
                        {hobby.name.includes('K9') && <span className="text-green-500 text-xs print:text-gray-600">• Morale +10</span>}
                        {hobby.name.includes('Gaming') && <span className="text-green-500 text-xs print:text-gray-600">• Strategic Thinking</span>}
                        {hobby.name.includes('Trail') && <span className="text-green-500 text-xs print:text-gray-600">• Endurance Training</span>}
                        {hobby.name.includes('Electronics') && <span className="text-green-500 text-xs print:text-gray-600">• R&D Projects</span>}
                        {hobby.name.includes('CLASSIFIED') && <span className="text-green-500 text-xs print:text-gray-600">• [REDACTED]</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedSection === 'skills' && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30">
                  <h2 className="text-xl text-green-500 mb-4">TECHNICAL STACK MASTERY</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-white font-bold mb-3">Languages & Frameworks</h3>
                      <div className="space-y-2">
                        {[
                          { tech: 'JavaScript/TypeScript', level: 95 },
                          { tech: 'React/Node.js', level: 90 },
                          { tech: 'Python/Go', level: 85 },
                          { tech: 'Java/Scala', level: 80 }
                        ].map((item) => (
                          <div key={item.tech}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{item.tech}</span>
                              <span className="text-green-500">{item.level}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded">
                              <motion.div
                                className="h-full bg-green-500 rounded"
                                initial={{ width: 0 }}
                                animate={{ width: `${item.level}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-bold mb-3">Infrastructure & DevOps</h3>
                      <div className="space-y-2">
                        {[
                          { tech: 'AWS/Azure/GCP', level: 90 },
                          { tech: 'Docker/Kubernetes', level: 85 },
                          { tech: 'Terraform/Ansible', level: 80 },
                          { tech: 'CI/CD Pipelines', level: 95 }
                        ].map((item) => (
                          <div key={item.tech}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{item.tech}</span>
                              <span className="text-green-500">{item.level}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded">
                              <motion.div
                                className="h-full bg-green-500 rounded"
                                initial={{ width: 0 }}
                                animate={{ width: `${item.level}%` }}
                                transition={{ duration: 1, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-bold mb-3">Data & Analytics</h3>
                      <div className="space-y-2">
                        {[
                          { tech: 'PostgreSQL/MySQL', level: 85 },
                          { tech: 'Redis/Kafka', level: 80 },
                          { tech: 'Elasticsearch', level: 75 },
                          { tech: 'Data Warehousing', level: 70 }
                        ].map((item) => (
                          <div key={item.tech}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">{item.tech}</span>
                              <span className="text-green-500">{item.level}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded">
                              <motion.div
                                className="h-full bg-green-500 rounded"
                                initial={{ width: 0 }}
                                animate={{ width: `${item.level}%` }}
                                transition={{ duration: 1, delay: 0.6 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30">
                  <h2 className="text-xl text-green-500 mb-4">ARCHITECTURE & DESIGN PATTERNS</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-bold mb-2">System Design Expertise</h4>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• Microservices & Distributed Systems</li>
                        <li>• Event-Driven Architecture</li>
                        <li>• Domain-Driven Design (DDD)</li>
                        <li>• CQRS & Event Sourcing</li>
                        <li>• API Gateway & Service Mesh</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2">Security & Compliance</h4>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• OAuth 2.0 & JWT Implementation</li>
                        <li>• GDPR & SOC 2 Compliance</li>
                        <li>• Vulnerability Assessment & Remediation</li>
                        <li>• Zero Trust Security Model</li>
                        <li>• Penetration Testing & Red Team Exercises</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedSection === 'experience' && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30 print:bg-transparent print:border-gray-300 print:page-break-inside-avoid">
                  <h2 className="text-xl text-green-500 mb-4 print:text-black">MISSION HISTORY</h2>
                  
                  <div className="space-y-6">
                    {jobSites.map((job: any, index: number) => (
                      <div key={job.id} className="border-l-4 border-green-500/50 pl-6 print:border-gray-400">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-white font-bold text-lg print:text-black">
                              {job.name}
                              {job.codename && (
                                <span className="text-green-500 text-sm ml-2 print:text-gray-600">
                                  [{job.codename}]
                                </span>
                              )}
                            </h3>
                            <p className="text-green-500 text-sm mb-2 print:text-gray-600">
                              {job.period?.start} - {job.period?.end || 'Present'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 print:text-gray-400">
                            {job.engagementType?.replace('-', ' ').toUpperCase()}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3 print:text-black">
                          {job.briefing}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-green-400 text-sm font-bold mb-2 print:text-gray-700">DEPLOYMENT LOGS</h4>
                            <ul className="text-gray-300 space-y-1 text-sm print:text-black">
                              {job.deploymentLogs?.map((log: string, logIndex: number) => (
                                <li key={logIndex}>• {log}</li>
                              )) || []}
                            </ul>
                          </div>
                          
                          {job.afterAction && job.afterAction.length > 0 && (
                            <div>
                              <h4 className="text-green-400 text-sm font-bold mb-2 print:text-gray-700">AFTER ACTION REPORT</h4>
                              <ul className="text-gray-300 space-y-1 text-sm print:text-black">
                                {job.afterAction.map((insight: string, insightIndex: number) => (
                                  <li key={insightIndex}>• {insight}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {index === 0 && (
                          <div className="mt-3 p-3 bg-green-500/10 rounded border border-green-500/30 print:bg-gray-100 print:border-gray-300">
                            <p className="text-green-400 text-xs print:text-gray-600">
                              <strong>Current Mission:</strong> Leading C2 systems integration and data platform engineering. 
                              Driving IL-5/IL-6 compliance initiatives and event-driven architecture implementation.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30 print:bg-transparent print:border-gray-300">
                  <h2 className="text-xl text-green-500 mb-4 print:text-black">COMMAND PHILOSOPHY & IMPACT</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-bold mb-2 print:text-black">Leadership Principles</h4>
                      <ul className="text-gray-300 space-y-1 text-sm print:text-black">
                        <li>• Mission-first mindset with execution excellence</li>
                        <li>• Data-driven decision making and continuous improvement</li>
                        <li>• Servant leadership empowering individual growth</li>
                        <li>• Technical excellence as competitive advantage</li>
                        <li>• Cross-functional collaboration and shared accountability</li>
                        <li>• Security-first development methodologies</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2 print:text-black">Quantified Impact</h4>
                      <ul className="text-gray-300 space-y-1 text-sm print:text-black">
                        <li>• Scaled engineering teams from 2 to 25+ members</li>
                        <li>• Mentored 50+ engineers throughout career</li>
                        <li>• Achieved 95% team retention over 3 years</li>
                        <li>• Built inclusive culture (40% female engineering ratio)</li>
                        <li>• Reduced deployment time by 85% through DevOps</li>
                        <li>• Generated $50M+ in revenue through platform features</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedSection === 'projects' && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30 print:bg-transparent print:border-gray-300">
                  <h2 className="text-xl text-green-500 mb-4 print:text-black">SELECTED OPERATIONS</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border border-green-500/30 p-4 rounded print:border-gray-300">
                        <h3 className="text-green-400 font-bold mb-2 print:text-gray-700">PLATFORM ENGINEERING</h3>
                        <h4 className="text-white font-semibold mb-1 print:text-black">HubSpot Developer Platform</h4>
                        <p className="text-gray-300 text-sm mb-2 print:text-black">
                          Built developer platform infrastructure serving 100K+ developers with 50M+ API calls daily.
                        </p>
                        <div className="text-green-500 text-xs print:text-gray-600">
                          <span className="bg-green-500/20 px-2 py-1 rounded mr-2 print:bg-gray-200">React</span>
                          <span className="bg-green-500/20 px-2 py-1 rounded mr-2 print:bg-gray-200">Node.js</span>
                          <span className="bg-green-500/20 px-2 py-1 rounded print:bg-gray-200">Microservices</span>
                        </div>
                      </div>
                      
                      <div className="border border-green-500/30 p-4 rounded print:border-gray-300">
                        <h3 className="text-green-400 font-bold mb-2 print:text-gray-700">C2 INTEGRATION</h3>
                        <h4 className="text-white font-semibold mb-1 print:text-black">Picogrid Edge Platform</h4>
                        <p className="text-gray-300 text-sm mb-2 print:text-black">
                          Architected IL-5/IL-6 compliant data integration layer with event-driven messaging.
                        </p>
                        <div className="text-green-500 text-xs print:text-gray-600">
                          <span className="bg-green-500/20 px-2 py-1 rounded mr-2 print:bg-gray-200">Go</span>
                          <span className="bg-green-500/20 px-2 py-1 rounded mr-2 print:bg-gray-200">NATS</span>
                          <span className="bg-green-500/20 px-2 py-1 rounded print:bg-gray-200">K8s</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border border-green-500/30 p-4 rounded print:border-gray-300">
                        <h3 className="text-green-400 font-bold mb-2 print:text-gray-700">INFRASTRUCTURE MODERNIZATION</h3>
                        <h4 className="text-white font-semibold mb-1 print:text-black">Amtrak Digital Platform</h4>
                        <p className="text-gray-300 text-sm mb-2 print:text-black">
                          Led modernization of national passenger rail ticketing across 500+ stations.
                        </p>
                        <div className="text-green-500 text-xs print:text-gray-600">
                          <span className="bg-green-500/20 px-2 py-1 rounded mr-2 print:bg-gray-200">Java</span>
                          <span className="bg-green-500/20 px-2 py-1 rounded mr-2 print:bg-gray-200">AWS</span>
                          <span className="bg-green-500/20 px-2 py-1 rounded print:bg-gray-200">PostgreSQL</span>
                        </div>
                      </div>
                      
                      <div className="border border-green-500/30 p-4 rounded print:border-gray-300">
                        <h3 className="text-green-400 font-bold mb-2 print:text-gray-700">INTELLIGENCE SYSTEMS</h3>
                        <h4 className="text-white font-semibold mb-1 print:text-black">USMC C2 Operations</h4>
                        <p className="text-gray-300 text-sm mb-2 print:text-black">
                          Managed classified communications and intelligence analysis systems for MEU deployments.
                        </p>
                        <div className="text-green-500 text-xs print:text-gray-600">
                          <span className="bg-green-500/20 px-2 py-1 rounded mr-2 print:bg-gray-200">CLASSIFIED</span>
                          <span className="bg-green-500/20 px-2 py-1 rounded mr-2 print:bg-gray-200">C2</span>
                          <span className="bg-green-500/20 px-2 py-1 rounded print:bg-gray-200">SIGINT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-500/10 rounded border border-green-500/30 print:bg-gray-100 print:border-gray-300">
                    <h4 className="text-green-400 font-bold mb-2 print:text-gray-700">OPERATIONAL OUTCOMES</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400 print:text-gray-600">Platform Reliability:</span>
                        <span className="text-white ml-2 print:text-black">99.9% uptime</span>
                      </div>
                      <div>
                        <span className="text-gray-400 print:text-gray-600">Developer Adoption:</span>
                        <span className="text-white ml-2 print:text-black">100K+ users</span>
                      </div>
                      <div>
                        <span className="text-gray-400 print:text-gray-600">Performance Gains:</span>
                        <span className="text-white ml-2 print:text-black">300% throughput</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedSection === 'contact' && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30 print:bg-transparent print:border-gray-300">
                  <h2 className="text-xl text-green-500 mb-4 print:text-black">SECURE COMMUNICATIONS</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-white font-bold mb-3 print:text-black">Primary Channels</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded border border-gray-700 print:bg-gray-100 print:border-gray-300">
                          <span className="text-green-500 print:text-gray-600">📧</span>
                          <div>
                            <div className="text-white text-sm print:text-black">
                              {resumeData?.executiveBriefing?.contact?.email || 'mark@picogrid.com'}
                            </div>
                            <div className="text-gray-400 text-xs print:text-gray-600">Encrypted Email (PGP Available)</div>
                          </div>
                        </div>
                        
                        {resumeData?.executiveBriefing?.contact?.linkedin && (
                          <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded border border-gray-700 print:bg-gray-100 print:border-gray-300">
                            <span className="text-green-500 print:text-gray-600">💼</span>
                            <div>
                              <div className="text-white text-sm print:text-black">linkedin.com/in/marktripoli</div>
                              <div className="text-gray-400 text-xs print:text-gray-600">Professional Network</div>
                            </div>
                          </div>
                        )}
                        
                        {resumeData?.executiveBriefing?.contact?.github && (
                          <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded border border-gray-700 print:bg-gray-100 print:border-gray-300">
                            <span className="text-green-500 print:text-gray-600">🐙</span>
                            <div>
                              <div className="text-white text-sm print:text-black">github.com/tripolipg</div>
                              <div className="text-gray-400 text-xs print:text-gray-600">Code Repository & Portfolio</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-bold mb-3 print:text-black">Response Matrix</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-gray-800 rounded text-sm print:bg-gray-100">
                          <span className="text-gray-300 print:text-black">Strategic Opportunities:</span>
                          <span className="text-green-500 print:text-gray-600">&lt; 4 hours</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-800 rounded text-sm print:bg-gray-100">
                          <span className="text-gray-300 print:text-black">Technical Discussions:</span>
                          <span className="text-green-500 print:text-gray-600">&lt; 24 hours</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-800 rounded text-sm print:bg-gray-100">
                          <span className="text-gray-300 print:text-black">General Inquiries:</span>
                          <span className="text-green-500 print:text-gray-600">&lt; 48 hours</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-800 rounded text-sm print:bg-gray-100">
                          <span className="text-gray-300 print:text-black">Executive Opportunities:</span>
                          <span className="text-green-500 print:text-gray-600">Same Day</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-green-500/10 rounded border border-green-500/30 print:bg-gray-100 print:border-gray-300">
                        <p className="text-green-400 text-xs print:text-gray-600">
                          <strong>Current Status:</strong> Open to VP Engineering, CTO, and technical co-founder 
                          opportunities. Particularly interested in early-stage companies with complex technical 
                          challenges, C2/defense applications, and high-growth trajectories.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30 print:bg-transparent print:border-gray-300">
                  <h2 className="text-xl text-green-500 mb-4 print:text-black">MISSION PARAMETERS</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-white font-bold mb-2 print:text-black">Target Engagements</h4>
                      <ul className="text-gray-300 space-y-1 text-sm print:text-black">
                        <li>• VP Engineering / CTO roles</li>
                        <li>• Technical co-founder opportunities</li>
                        <li>• Series A-C scaling challenges</li>
                        <li>• C2/Defense technology applications</li>
                        <li>• Platform engineering leadership</li>
                        <li>• Team building and culture development</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2 print:text-black">Geographic Flexibility</h4>
                      <ul className="text-gray-300 space-y-1 text-sm print:text-black">
                        <li>• Los Angeles (Current Base)</li>
                        <li>• Remote-first organizations preferred</li>
                        <li>• Quarterly travel acceptable</li>
                        <li>• Relocation considered for strategic opportunities</li>
                        <li>• International assignments available</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2 print:text-black">Security Clearance</h4>
                      <ul className="text-gray-300 space-y-1 text-sm print:text-black">
                        <li>• SECRET clearance (USMC, can reactivate)</li>
                        <li>• Polygraph examination cleared</li>
                        <li>• Background investigation current</li>
                        <li>• FedRAMP/RMF compliance experience</li>
                        <li>• IL-5/IL-6 system development</li>
                        <li>• Government contracting eligible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Contact CTA Section - Print Only */}
      <div className="hidden print:block mt-8 p-6 bg-gray-100 border border-gray-300 text-center">
        <h2 className="text-xl font-bold text-black mb-2">INITIATE SECURE CONTACT</h2>
        <p className="text-gray-600 mb-3">
          Ready to discuss strategic engineering leadership opportunities
        </p>
        <div className="space-y-2">
          <div className="font-mono text-sm text-black">
            📧 {resumeData?.executiveBriefing?.contact?.email || 'mark@picogrid.com'}
          </div>
          <div className="font-mono text-sm text-gray-600">
            💼 linkedin.com/in/marktripoli
          </div>
          <div className="font-mono text-sm text-gray-600">
            🐙 github.com/tripolipg
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Response time for strategic opportunities: &lt; 4 hours
        </div>
      </div>

      {/* PDF Export Loading Overlay */}
      {showPDFExport && (
        <motion.div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center print:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-green-500 font-mono">PREPARING BRIEFING FOR PRINT...</p>
            <p className="text-gray-400 text-sm mt-2">Optimizing for secure transmission...</p>
          </div>
        </motion.div>
      )}
      
      {/* Print-only styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5in;
            size: letter;
          }
          
          body {
            font-size: 12px;
            line-height: 1.4;
          }
          
          .print\\:page-break-before {
            page-break-before: always;
          }
          
          .print\\:page-break-inside-avoid {
            page-break-inside: avoid;
          }
          
          .print\\:break-after-page {
            page-break-after: always;
          }
          
          /* Ensure proper contrast for print */
          .text-green-500 {
            color: #000 !important;
          }
          
          .bg-green-500\/10 {
            background-color: #f5f5f5 !important;
          }
          
          .border-green-500\/30 {
            border-color: #ccc !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ExecutiveBriefing;

// Add print optimization styles to the document head
if (typeof document !== 'undefined') {
  const printStyles = `
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      body {
        font-family: 'Times New Roman', serif !important;
        font-size: 11pt !important;
        line-height: 1.3 !important;
        color: #000 !important;
        background: #fff !important;
      }
      
      .font-mono {
        font-family: 'Courier New', monospace !important;
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: #000 !important;
        font-weight: bold !important;
        page-break-after: avoid;
      }
      
      .text-green-500 {
        color: #000 !important;
        font-weight: bold !important;
      }
      
      .bg-gray-900\/50,
      .bg-gray-800 {
        background: transparent !important;
        border: 1px solid #ccc !important;
      }
      
      .border-green-500\/30,
      .border-green-500\/50 {
        border-color: #666 !important;
      }
      
      .animate-pulse,
      .animate-spin {
        animation: none !important;
      }
      
      a {
        color: #000 !important;
        text-decoration: underline !important;
      }
    }
  `;
  
  // Create and inject print stylesheet
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerHTML = printStyles;
  
  // Only add if not already present
  if (!document.querySelector('[data-executive-briefing-print]')) {
    styleSheet.setAttribute('data-executive-briefing-print', 'true');
    document.head.appendChild(styleSheet);
  }
}