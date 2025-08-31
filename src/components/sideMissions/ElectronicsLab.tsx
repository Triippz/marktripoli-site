import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  type: 'iot' | 'embedded' | 'pcb' | 'prototype';
  status: 'completed' | 'active' | 'planning';
  components: string[];
  description: string;
  complexity: 1 | 2 | 3 | 4 | 5;
  image?: string;
}

const labProjects: Project[] = [
  {
    id: 'smart_irrigation',
    name: 'Smart Irrigation Controller',
    type: 'iot',
    status: 'completed',
    components: ['ESP32', 'Soil Sensors', 'Relay Module', 'Solar Panel'],
    description: 'Automated irrigation system with soil moisture monitoring and weather API integration. Reduces water usage by 40% while maintaining optimal plant health.',
    complexity: 4
  },
  {
    id: 'led_matrix',
    name: 'RGB LED Matrix Display',
    type: 'embedded',
    status: 'completed',
    components: ['Arduino Nano', '32x32 LED Matrix', 'Real-time Clock', 'WiFi Module'],
    description: 'Programmable LED display with weather, time, and notification integration. Features custom animations and remote control via mobile app.',
    complexity: 3
  },
  {
    id: 'security_camera',
    name: 'Edge AI Security Camera',
    type: 'iot',
    status: 'active',
    components: ['Raspberry Pi 4', 'Camera Module', 'PIR Sensor', 'Machine Learning'],
    description: 'Computer vision-enabled security system with person detection, facial recognition, and encrypted cloud storage. Real-time alerts via encrypted channels.',
    complexity: 5
  },
  {
    id: 'weather_station',
    name: 'Tactical Weather Station',
    type: 'iot',
    status: 'completed',
    components: ['ESP8266', 'BME280', 'Wind Sensor', 'Rain Gauge'],
    description: 'Military-grade weather monitoring with data logging, trend analysis, and integration with mission planning systems.',
    complexity: 3
  },
  {
    id: 'drone_controller',
    name: 'FPV Drone Flight Controller',
    type: 'embedded',
    status: 'planning',
    components: ['Flight Controller', 'ESCs', 'Brushless Motors', 'FPV Camera'],
    description: 'Custom drone build for aerial reconnaissance and photography. Features autonomous flight modes and real-time video transmission.',
    complexity: 5
  },
  {
    id: 'home_automation',
    name: 'Mission Control Hub',
    type: 'iot',
    status: 'active',
    components: ['Raspberry Pi', 'Z-Wave Module', 'Touch Display', 'Voice Recognition'],
    description: 'Central command station for home automation, security systems, and IoT device management. Voice-activated with natural language processing.',
    complexity: 4
  }
];

interface FlashFirmwareProps {
  project: Project;
  onComplete: () => void;
}

function FlashFirmwareSequence({ project, onComplete }: FlashFirmwareProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const flashSteps = [
    'Connecting to target device...',
    'Verifying bootloader mode...',
    'Erasing existing firmware...',
    'Programming new firmware...',
    'Verifying flash integrity...',
    'Resetting device...',
    'Flash operation complete!'
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < flashSteps.length - 1) {
        setStep(prev => prev + 1);
        setProgress(((step + 1) / flashSteps.length) * 100);
      } else {
        setTimeout(onComplete, 1000);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [step, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="terminal-window max-w-md">
        <div className="terminal-header">
          <div className="holo-text font-mono">FLASHING FIRMWARE</div>
        </div>
        <div className="terminal-content space-y-4">
          <div className="text-center">
            <div className="text-lg text-green-500 font-mono mb-2">⚡</div>
            <div className="text-white font-mono text-sm">{project.name}</div>
          </div>
          
          <div className="matrix-text text-center text-sm">
            {flashSteps[step]}
          </div>
          
          <div className="tactical-progress">
            <motion.div 
              className="tactical-progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="text-center text-xs text-gray-400 font-mono">
            {Math.round(progress)}% Complete
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ElectronicsLab() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showFlashSequence, setShowFlashSequence] = useState(false);
  const [labStatus, setLabStatus] = useState('operational');

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'active': return '🔄';
      case 'planning': return '📋';
    }
  };

  const getComplexityStars = (complexity: number) => {
    return '★'.repeat(complexity) + '☆'.repeat(5 - complexity);
  };

  const handleFlashFirmware = (project: Project) => {
    setShowFlashSequence(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="border-b border-green-500/30 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <h2 className="text-xl font-mono text-green-500">
              ELECTRONICS LAB
            </h2>
          </div>
          <div className="status-indicator">
            <div className="status-dot active"></div>
            <span className="text-xs uppercase">LAB {labStatus}</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm font-mono mt-2">
          Advanced prototyping and embedded systems development facility
        </p>
      </div>

      {/* Lab Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-xl font-mono text-green-500">
            {labProjects.filter(p => p.status === 'completed').length}
          </div>
          <div className="text-xs font-mono text-gray-400">COMPLETED</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-mono text-yellow-500">
            {labProjects.filter(p => p.status === 'active').length}
          </div>
          <div className="text-xs font-mono text-gray-400">ACTIVE</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-mono text-blue-500">
            {labProjects.filter(p => p.status === 'planning').length}
          </div>
          <div className="text-xs font-mono text-gray-400">PLANNED</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-mono text-green-500">72°F</div>
          <div className="text-xs font-mono text-gray-400">LAB TEMP</div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {labProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="tactical-panel p-4 cursor-pointer hover:bg-green-500/5"
            onClick={() => setSelectedProject(project)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span>{getStatusIcon(project.status)}</span>
                <div>
                  <h3 className="text-white font-mono text-sm">{project.name}</h3>
                  <div className="text-green-500 text-xs font-mono uppercase">
                    {project.type}
                  </div>
                </div>
              </div>
              <div className="text-yellow-500 text-xs font-mono">
                {getComplexityStars(project.complexity)}
              </div>
            </div>
            
            <p className="text-gray-300 text-xs leading-relaxed mb-3">
              {project.description.slice(0, 100)}...
            </p>
            
            <div className="flex flex-wrap gap-1">
              {project.components.slice(0, 3).map(component => (
                <span 
                  key={component}
                  className="bg-gray-800 text-green-500 px-2 py-1 rounded text-xs font-mono"
                >
                  {component}
                </span>
              ))}
              {project.components.length > 3 && (
                <span className="text-gray-400 text-xs font-mono">
                  +{project.components.length - 3} more
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="terminal-window max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="terminal-header">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span>{getStatusIcon(selectedProject.status)}</span>
                    <div className="holo-text font-mono">PROJECT DETAILS</div>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="text-green-500 hover:text-red-400 font-mono text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="terminal-content space-y-6">
                <div>
                  <h3 className="text-green-500 font-mono text-xl mb-2">
                    {selectedProject.name}
                  </h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-green-500 text-sm font-mono uppercase">
                      {selectedProject.type}
                    </span>
                    <span className="text-yellow-500 text-sm font-mono">
                      Complexity: {getComplexityStars(selectedProject.complexity)}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Component List */}
                <div>
                  <h4 className="text-green-500 font-mono text-sm mb-3 uppercase">
                    Bill of Materials
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProject.components.map(component => (
                      <div 
                        key={component}
                        className="bg-gray-900 border border-green-500/30 p-2 rounded text-xs font-mono text-gray-300"
                      >
                        • {component}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {selectedProject.status === 'active' && (
                    <button
                      onClick={() => handleFlashFirmware(selectedProject)}
                      className="tactical-button flex-1 py-2"
                    >
                      ⚡ FLASH FIRMWARE
                    </button>
                  )}
                  <button className="tactical-button flex-1 py-2">
                    📊 VIEW SCHEMATICS
                  </button>
                  <button className="tactical-button flex-1 py-2">
                    🔧 MODIFY PROJECT
                  </button>
                </div>

                {/* Technical Specs */}
                <div className="hud-panel p-4">
                  <div className="text-green-500 text-xs font-mono mb-2 uppercase">
                    Technical Specifications
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <div className="text-gray-400">Power Requirements:</div>
                      <div className="text-white">3.3V - 5V DC</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Operating Temp:</div>
                      <div className="text-white">-20°C to 85°C</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Communication:</div>
                      <div className="text-white">WiFi/Bluetooth/Serial</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Update Method:</div>
                      <div className="text-white">OTA/USB/JTAG</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash Firmware Sequence */}
      <AnimatePresence>
        {showFlashSequence && selectedProject && (
          <FlashFirmwareSequence
            project={selectedProject}
            onComplete={() => {
              setShowFlashSequence(false);
              setSelectedProject(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ElectronicsLab;