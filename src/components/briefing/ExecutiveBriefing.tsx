import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useMissionControl } from '../../store/missionControl';

function ExecutiveBriefing() {
  const [selectedSection, setSelectedSection] = useState<'overview' | 'technical' | 'leadership' | 'contact'>('overview');
  const [showPDFExport, setShowPDFExport] = useState(false);
  const { unlockEasterEgg } = useMissionControl();

  // Unlock executive briefing easter egg on component mount
  useEffect(() => {
    unlockEasterEgg('executive_briefing');
  }, [unlockEasterEgg]);

  const sections = [
    { id: 'overview', label: 'EXECUTIVE SUMMARY', icon: '🎯' },
    { id: 'technical', label: 'TECHNICAL EXPERTISE', icon: '⚙️' },
    { id: 'leadership', label: 'LEADERSHIP RECORD', icon: '👑' },
    { id: 'contact', label: 'SECURE COMMS', icon: '📡' }
  ] as const;

  const handlePDFExport = () => {
    setShowPDFExport(true);
    // In a real implementation, this would generate and download a PDF
    setTimeout(() => {
      setShowPDFExport(false);
      // Simulate PDF download
      const link = document.createElement('a');
      link.href = '#';
      link.download = 'mark-tripoli-executive-briefing.pdf';
      link.click();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <div className="border-b border-green-500/30 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-500 mb-2">
              EXECUTIVE BRIEFING
            </h1>
            <p className="text-gray-400">
              Classification: EXECUTIVE ACCESS / Strategic Leadership Assessment
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={handlePDFExport}
              disabled={showPDFExport}
              className="bg-gray-800 border border-green-500/50 text-green-500 px-4 py-2 rounded hover:bg-green-500/10 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPDFExport ? 'GENERATING...' : 'EXPORT PDF'}
            </motion.button>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Navigation Sidebar */}
        <div className="w-64 border-r border-green-500/30 p-6">
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

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-gray-900/50 rounded border border-gray-700">
            <h4 className="text-green-500 text-sm mb-3">MISSION METRICS</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Years Experience:</span>
                <span className="text-white">12+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Team Size Led:</span>
                <span className="text-white">25+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Impact:</span>
                <span className="text-white">$50M+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Security Clearance:</span>
                <span className="text-white">SECRET</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <motion.div
            key={selectedSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {selectedSection === 'overview' && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30">
                  <h2 className="text-xl text-green-500 mb-4">STRATEGIC PROFILE</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-white font-bold mb-2">Core Competencies</h3>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• Full-stack engineering leadership & architecture</li>
                        <li>• DevOps & CI/CD pipeline optimization</li>
                        <li>• Team scaling & cross-functional collaboration</li>
                        <li>• Product strategy & technical roadmap planning</li>
                        <li>• Security-first development methodologies</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-2">Industry Verticals</h3>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• Enterprise SaaS & Marketing Technology</li>
                        <li>• Defense & Government Contracting</li>
                        <li>• Transportation & Infrastructure</li>
                        <li>• Telecommunications & Network Operations</li>
                        <li>• IoT & Embedded Systems Development</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30">
                  <h2 className="text-xl text-green-500 mb-4">EXECUTIVE SUMMARY</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Senior Engineering Leader with 12+ years of experience architecting and delivering 
                    enterprise-scale solutions. Proven track record of building and leading high-performing 
                    engineering teams, driving technical strategy, and delivering mission-critical systems 
                    that generate significant revenue impact. Combines deep technical expertise with 
                    strategic business acumen and military-grade operational discipline.
                  </p>
                  <div className="mt-4 p-4 bg-green-500/10 rounded border border-green-500/30">
                    <p className="text-green-400 text-sm">
                      <strong>Key Achievement:</strong> Led 25-person engineering organization at HubSpot, 
                      delivering platform capabilities that enabled $50M+ in annual revenue growth while 
                      maintaining 99.9% uptime across distributed microservices architecture.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedSection === 'technical' && (
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

            {selectedSection === 'leadership' && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30">
                  <h2 className="text-xl text-green-500 mb-4">COMMAND EXPERIENCE</h2>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-green-500/50 pl-6">
                      <h3 className="text-white font-bold text-lg">HubSpot - Senior Engineering Manager</h3>
                      <p className="text-green-500 text-sm mb-2">2019-2024 • Boston, MA</p>
                      <ul className="text-gray-300 space-y-2 text-sm">
                        <li>• Led 25-person engineering organization across 4 product teams</li>
                        <li>• Drove technical strategy for $50M+ revenue-generating platform features</li>
                        <li>• Established DevOps practices reducing deployment time by 85%</li>
                        <li>• Implemented hiring processes scaling team from 8 to 25 engineers</li>
                        <li>• Architected microservices migration handling 100M+ requests/day</li>
                      </ul>
                      <div className="mt-3 p-3 bg-green-500/10 rounded border border-green-500/30">
                        <p className="text-green-400 text-xs">
                          <strong>Impact:</strong> Delivered platform capabilities enabling 40% increase in enterprise 
                          deal velocity while maintaining 99.9% uptime across all services.
                        </p>
                      </div>
                    </div>

                    <div className="border-l-4 border-green-500/50 pl-6">
                      <h3 className="text-white font-bold text-lg">Picogrid - Co-Founder & CTO</h3>
                      <p className="text-green-500 text-sm mb-2">2016-2019 • Cambridge, MA</p>
                      <ul className="text-gray-300 space-y-2 text-sm">
                        <li>• Founded energy analytics startup, raised $2M seed funding</li>
                        <li>• Built full-stack IoT platform processing 1M+ sensor readings daily</li>
                        <li>• Led product strategy resulting in pilot programs with Fortune 500 clients</li>
                        <li>• Established technical culture and engineering practices from ground up</li>
                        <li>• Managed cross-functional team of 12 across engineering, sales, and operations</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500/50 pl-6">
                      <h3 className="text-white font-bold text-lg">U.S. Marine Corps - Intelligence Analyst</h3>
                      <p className="text-green-500 text-sm mb-2">2009-2013 • Camp Lejeune, NC</p>
                      <ul className="text-gray-300 space-y-2 text-sm">
                        <li>• Led intelligence analysis for Marine Expeditionary Unit deployments</li>
                        <li>• Managed classified data systems and communications infrastructure</li>
                        <li>• Trained and mentored junior analysts on operational procedures</li>
                        <li>• Maintained SECRET security clearance with polygraph examination</li>
                        <li>• Received Navy Achievement Medal for exceptional performance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30">
                  <h2 className="text-xl text-green-500 mb-4">LEADERSHIP PHILOSOPHY</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-bold mb-2">Core Principles</h4>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• Mission-first mindset with execution excellence</li>
                        <li>• Data-driven decision making and continuous improvement</li>
                        <li>• Servant leadership empowering individual growth</li>
                        <li>• Technical excellence as competitive advantage</li>
                        <li>• Cross-functional collaboration and shared accountability</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2">Team Development</h4>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• Mentored 50+ engineers throughout career</li>
                        <li>• Established technical career progression frameworks</li>
                        <li>• Created inclusive culture with 40% female engineering ratio</li>
                        <li>• Implemented knowledge sharing and documentation practices</li>
                        <li>• Built high-retention teams (95% retention over 3 years)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedSection === 'contact' && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30">
                  <h2 className="text-xl text-green-500 mb-4">ENCRYPTED COMMUNICATIONS</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-white font-bold mb-3">Primary Channels</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded border border-gray-700">
                          <span className="text-green-500">📧</span>
                          <div>
                            <div className="text-white text-sm">mark@picogrid.com</div>
                            <div className="text-gray-400 text-xs">Encrypted Email (PGP Available)</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded border border-gray-700">
                          <span className="text-green-500">💼</span>
                          <div>
                            <div className="text-white text-sm">linkedin.com/in/marktripoli</div>
                            <div className="text-gray-400 text-xs">Professional Network</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded border border-gray-700">
                          <span className="text-green-500">🐙</span>
                          <div>
                            <div className="text-white text-sm">github.com/tripolipg</div>
                            <div className="text-gray-400 text-xs">Code Repository</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-bold mb-3">Response Matrix</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-gray-800 rounded text-sm">
                          <span className="text-gray-300">Strategic Opportunities:</span>
                          <span className="text-green-500">&lt; 4 hours</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-800 rounded text-sm">
                          <span className="text-gray-300">Technical Discussions:</span>
                          <span className="text-green-500">&lt; 24 hours</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-800 rounded text-sm">
                          <span className="text-gray-300">General Inquiries:</span>
                          <span className="text-green-500">&lt; 48 hours</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-800 rounded text-sm">
                          <span className="text-gray-300">Recruitment Calls:</span>
                          <span className="text-green-500">Same Day</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-green-500/10 rounded border border-green-500/30">
                        <p className="text-green-400 text-xs">
                          <strong>Availability:</strong> Open to executive and senior engineering leadership 
                          roles. Particularly interested in early-stage companies with complex technical 
                          challenges and growth trajectories.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-6 rounded border border-green-500/30">
                  <h2 className="text-xl text-green-500 mb-4">MISSION PARAMETERS</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-white font-bold mb-2">Ideal Engagement</h4>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• VP Engineering / CTO roles</li>
                        <li>• Technical co-founder opportunities</li>
                        <li>• Series A-C scaling challenges</li>
                        <li>• Complex technical architecture</li>
                        <li>• Team building and culture development</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2">Geographic Flexibility</h4>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• Boston/Cambridge (Home Base)</li>
                        <li>• Remote-first organizations</li>
                        <li>• Quarterly travel acceptable</li>
                        <li>• Relocation considered for right opportunity</li>
                        <li>• International assignments available</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2">Security Clearance</h4>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        <li>• Current: SECRET (Inactive)</li>
                        <li>• Available for reactivation</li>
                        <li>• Polygraph examination cleared</li>
                        <li>• Background investigation current</li>
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

      {/* PDF Export Loading Overlay */}
      {showPDFExport && (
        <motion.div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-green-500 font-mono">GENERATING EXECUTIVE BRIEFING PDF...</p>
            <p className="text-gray-400 text-sm mt-2">Encrypting sensitive information...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ExecutiveBriefing;