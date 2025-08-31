import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { SiteData } from '../../types/mission';

interface EngagementStep {
  id: string;
  title: string;
  description: string;
  animation: 'typewriter' | 'matrix' | 'progress' | 'scan' | 'decode';
  duration: number;
  data?: any;
}

interface CareerSequence {
  siteId: string;
  title: string;
  steps: EngagementStep[];
  theme: {
    primary: string;
    accent: string;
    icon: string;
  };
}

const careerSequences: CareerSequence[] = [
  // HubSpot Engineering Leadership
  {
    siteId: 'hubspot',
    title: 'Platform Engineering Operations',
    theme: { primary: '#ff7a59', accent: '#ff9e85', icon: '🚀' },
    steps: [
      {
        id: 'auth',
        title: 'Engineering Auth Protocol',
        description: 'Authenticating with HubSpot platform systems...',
        animation: 'typewriter',
        duration: 2000
      },
      {
        id: 'cicd',
        title: 'CI/CD Pipeline Status',
        description: 'Analyzing continuous integration metrics',
        animation: 'progress',
        duration: 3000,
        data: {
          deployments: 847,
          success_rate: 99.2,
          avg_time: '4m 32s'
        }
      },
      {
        id: 'scale',
        title: 'Platform Scale Analysis',
        description: 'Reviewing microservices architecture performance',
        animation: 'scan',
        duration: 2500,
        data: {
          services: 156,
          requests_per_day: '2.3B',
          uptime: '99.95%'
        }
      },
      {
        id: 'team',
        title: 'Team Impact Metrics',
        description: 'Loading engineering leadership achievements',
        animation: 'matrix',
        duration: 2000,
        data: {
          team_size: 25,
          revenue_impact: '$50M+',
          efficiency_gain: '85%'
        }
      }
    ]
  },
  
  // Picogrid Startup Journey
  {
    siteId: 'picogrid',
    title: 'Startup Mission Control',
    theme: { primary: '#00d4aa', accent: '#26d9c2', icon: '⚡' },
    steps: [
      {
        id: 'founding',
        title: 'Startup Genesis Protocol',
        description: 'Initializing co-founder access credentials...',
        animation: 'typewriter',
        duration: 2000
      },
      {
        id: 'tech_stack',
        title: 'IoT Platform Architecture',
        description: 'Scanning full-stack technology deployment',
        animation: 'scan',
        duration: 3000,
        data: {
          sensors: '1M+ daily readings',
          platform: 'React/Node/Python',
          clients: 'Fortune 500 pilots'
        }
      },
      {
        id: 'funding',
        title: 'Venture Capital Engagement',
        description: 'Accessing investment and growth metrics',
        animation: 'progress',
        duration: 2500,
        data: {
          funding: '$2M seed',
          investors: '8 strategic',
          runway: '18 months'
        }
      },
      {
        id: 'pivot',
        title: 'Strategic Evolution Analysis',
        description: 'Decoding startup lessons and insights',
        animation: 'decode',
        duration: 2000,
        data: {
          lessons: 'Product-market fit',
          growth: 'B2B enterprise focus',
          outcome: 'Strategic acquisition'
        }
      }
    ]
  },
  
  // Marine Corps Intelligence
  {
    siteId: 'marines',
    title: 'Military Intelligence Operations',
    theme: { primary: '#8b0000', accent: '#cd5c5c', icon: '🇺🇸' },
    steps: [
      {
        id: 'clearance',
        title: 'Security Clearance Verification',
        description: 'Validating SECRET clearance credentials...',
        animation: 'typewriter',
        duration: 2500
      },
      {
        id: 'intel',
        title: 'Intelligence Analysis Protocol',
        description: 'Accessing classified operational data',
        animation: 'matrix',
        duration: 3000,
        data: {
          clearance: 'SECRET (Polygraph)',
          deployment: 'MEU Operations',
          specialization: 'CBRN Intelligence'
        }
      },
      {
        id: 'leadership',
        title: 'Military Leadership Record',
        description: 'Scanning command and training history',
        animation: 'scan',
        duration: 2000,
        data: {
          rank: 'Corporal (E-4)',
          awards: 'Navy Achievement Medal',
          training: 'Junior analyst mentor'
        }
      },
      {
        id: 'discipline',
        title: 'Operational Excellence',
        description: 'Loading military discipline and precision metrics',
        animation: 'progress',
        duration: 1500,
        data: {
          reliability: '100%',
          attention_to_detail: 'Exceptional',
          work_ethic: 'Superior'
        }
      }
    ]
  },
  
  // Amtrak Transportation Systems
  {
    siteId: 'amtrak',
    title: 'Transportation Network Control',
    theme: { primary: '#003366', accent: '#0066cc', icon: '🚄' },
    steps: [
      {
        id: 'network',
        title: 'Rail Network Authentication',
        description: 'Connecting to Amtrak operations center...',
        animation: 'typewriter',
        duration: 2000
      },
      {
        id: 'systems',
        title: 'IT Infrastructure Analysis',
        description: 'Scanning transportation technology systems',
        animation: 'scan',
        duration: 3000,
        data: {
          network: 'National rail operations',
          systems: 'Legacy modernization',
          impact: '500+ stations'
        }
      },
      {
        id: 'innovation',
        title: 'Digital Transformation',
        description: 'Loading infrastructure upgrade projects',
        animation: 'progress',
        duration: 2500,
        data: {
          projects: 'Mobile ticketing',
          efficiency: 'Route optimization',
          customer: 'Experience enhancement'
        }
      }
    ]
  },
  
  // Comcast Enterprise Technology
  {
    siteId: 'comcast',
    title: 'Enterprise Network Operations',
    theme: { primary: '#000000', accent: '#0066cc', icon: '📡' },
    steps: [
      {
        id: 'telecom',
        title: 'Telecommunications Access',
        description: 'Authenticating with enterprise network systems...',
        animation: 'typewriter',
        duration: 2000
      },
      {
        id: 'scale',
        title: 'Network Scale Assessment',
        description: 'Analyzing enterprise-grade infrastructure',
        animation: 'scan',
        duration: 3000,
        data: {
          customers: 'Fortune 500 enterprises',
          network: 'Nationwide fiber',
          reliability: '99.9% SLA'
        }
      },
      {
        id: 'technology',
        title: 'Advanced Technology Stack',
        description: 'Loading telecommunications innovation projects',
        animation: 'progress',
        duration: 2000,
        data: {
          focus: 'SD-WAN solutions',
          expertise: 'Network optimization',
          results: 'Cost reduction'
        }
      }
    ]
  }
];

interface CareerEngagementSequencesProps {
  site: SiteData;
  onComplete: () => void;
}

function CareerEngagementSequences({ site, onComplete }: CareerEngagementSequencesProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [stepComplete, setStepComplete] = useState(false);

  const sequence = careerSequences.find(seq => seq.siteId === site.id);

  useEffect(() => {
    if (!sequence) {
      onComplete();
      return;
    }

    setIsActive(true);
    setCurrentStep(0);
    setStepComplete(false);
  }, [sequence, onComplete]);

  useEffect(() => {
    if (!sequence || !isActive) return;

    const currentStepData = sequence.steps[currentStep];
    if (!currentStepData) return;

    const timer = setTimeout(() => {
      setStepComplete(true);
      
      // Move to next step after a brief pause
      setTimeout(() => {
        if (currentStep < sequence.steps.length - 1) {
          setCurrentStep(prev => prev + 1);
          setStepComplete(false);
        } else {
          // Sequence complete
          setTimeout(() => {
            setIsActive(false);
            onComplete();
          }, 1000);
        }
      }, 500);
    }, currentStepData.duration);

    return () => clearTimeout(timer);
  }, [currentStep, sequence, isActive, onComplete]);

  if (!sequence || !isActive) return null;

  const currentStepData = sequence.steps[currentStep];
  const progress = ((currentStep + (stepComplete ? 1 : 0)) / sequence.steps.length) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="terminal-window max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="terminal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{sequence.theme.icon}</span>
              <div className="holo-text text-lg font-mono">
                {sequence.title}
              </div>
            </div>
            <div className="text-xs font-mono" style={{ color: sequence.theme.accent }}>
              STEP {currentStep + 1}/{sequence.steps.length}
            </div>
          </div>
        </div>

        <div className="terminal-content space-y-6">
          {/* Current Step */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-4 h-4 rounded-full border-2"
                style={{ borderColor: sequence.theme.primary }}
                animate={stepComplete ? { 
                  backgroundColor: sequence.theme.primary,
                  scale: [1, 1.2, 1]
                } : {
                  backgroundColor: 'transparent'
                }}
              >
                {stepComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-full h-full rounded-full flex items-center justify-center text-white text-xs"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
              <div className="matrix-text text-lg font-mono">
                {currentStepData.title}
              </div>
            </div>

            <div className="ml-7 space-y-3">
              {currentStepData.animation === 'typewriter' && (
                <TypewriterAnimation 
                  text={currentStepData.description}
                  complete={stepComplete}
                />
              )}
              
              {currentStepData.animation === 'progress' && (
                <ProgressAnimation 
                  description={currentStepData.description}
                  data={currentStepData.data}
                  complete={stepComplete}
                  color={sequence.theme.primary}
                />
              )}
              
              {currentStepData.animation === 'scan' && (
                <ScanAnimation 
                  description={currentStepData.description}
                  data={currentStepData.data}
                  complete={stepComplete}
                  color={sequence.theme.accent}
                />
              )}
              
              {currentStepData.animation === 'matrix' && (
                <MatrixAnimation 
                  description={currentStepData.description}
                  data={currentStepData.data}
                  complete={stepComplete}
                />
              )}
              
              {currentStepData.animation === 'decode' && (
                <DecodeAnimation 
                  description={currentStepData.description}
                  data={currentStepData.data}
                  complete={stepComplete}
                  color={sequence.theme.primary}
                />
              )}
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-400">SEQUENCE PROGRESS</span>
              <span style={{ color: sequence.theme.accent }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="tactical-progress">
              <motion.div 
                className="h-full"
                style={{ backgroundColor: sequence.theme.primary }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Animation Components
function TypewriterAnimation({ text, complete }: { text: string; complete: boolean }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <div className="text-white font-mono">
      {displayText}<span className="animate-pulse">█</span>
    </div>
  );
}

function ProgressAnimation({ description, data, complete, color }: any) {
  return (
    <div className="space-y-2">
      <div className="text-gray-300 font-mono text-sm">{description}</div>
      {data && complete && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 text-xs font-mono"
        >
          {Object.entries(data).map(([key, value]: [string, any]) => (
            <div key={key} className="text-center p-2 bg-gray-800 rounded">
              <div style={{ color: color }}>{value}</div>
              <div className="text-gray-400 uppercase text-xs">{key.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function ScanAnimation({ description, data, complete, color }: any) {
  return (
    <div className="space-y-2">
      <div className="text-gray-300 font-mono text-sm">{description}</div>
      {!complete && (
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <div className="text-xs text-gray-400 font-mono">SCANNING...</div>
        </div>
      )}
      {data && complete && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-mono space-y-1"
        >
          {Object.entries(data).map(([key, value]: [string, any]) => (
            <div key={key} className="text-gray-300">
              <span className="text-gray-500">{key.replace(/_/g, ' ').toUpperCase()}:</span> {value}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function MatrixAnimation({ description, data, complete }: any) {
  return (
    <div className="space-y-2">
      <div className="text-gray-300 font-mono text-sm">{description}</div>
      {data && complete && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="matrix-text text-xs space-y-1"
        >
          {Object.entries(data).map(([key, value]: [string, any]) => (
            <div key={key}>
              {key.replace(/_/g, ' ').toUpperCase()}: {value}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function DecodeAnimation({ description, data, complete, color }: any) {
  return (
    <div className="space-y-2">
      <div className="text-gray-300 font-mono text-sm">{description}</div>
      {data && complete && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-mono space-y-1"
        >
          {Object.entries(data).map(([key, value]: [string, any]) => (
            <motion.div 
              key={key}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: Math.random() * 0.5 }}
              style={{ color: color }}
            >
              &gt; {key.replace(/_/g, ' ').toUpperCase()}: {value}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default CareerEngagementSequences;