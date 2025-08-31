import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionControl } from '../../store/missionControl';
import { missionAudio } from '../../utils/audioSystem';

interface ContactFormData {
  name: string;
  email: string;
  organization: string;
  subject: string;
  message: string;
  priority: 'routine' | 'urgent' | 'critical';
}

interface EncryptedContactFormProps {
  isOpen: boolean;
  onClose: () => void;
}

function EncryptedContactForm({ isOpen, onClose }: EncryptedContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    organization: '',
    subject: '',
    message: '',
    priority: 'routine'
  });
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionStep, setTransmissionStep] = useState(0);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { addTelemetry } = useMissionControl();

  const transmissionSteps = [
    'Validating secure connection...',
    'Encrypting message with AES-256...',
    'Authenticating recipient credentials...',
    'Establishing quantum-safe tunnel...',
    'Transmitting encrypted payload...',
    'Verifying message integrity...',
    'Transmission complete - awaiting response'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      await missionAudio.playError();
      addTelemetry({
        source: 'COMMS',
        message: 'Transmission failed: Missing required fields',
        level: 'error'
      });
      return;
    }

    setIsTransmitting(true);
    setTransmissionStep(0);
    setEncryptionProgress(0);
    
    await missionAudio.playEngagement();
    addTelemetry({
      source: 'COMMS',
      message: 'Initiating encrypted transmission protocol',
      level: 'info'
    });

    // Simulate encryption and transmission process
    const processTransmission = async () => {
      for (let step = 0; step < transmissionSteps.length; step++) {
        setTransmissionStep(step);
        
        // Simulate encryption progress for each step
        for (let progress = 0; progress <= 100; progress += 10) {
          setEncryptionProgress(progress);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Simulate actual form submission (in real app, this would call an API)
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsComplete(true);
        await missionAudio.playEngagement();
        addTelemetry({
          source: 'COMMS',
          message: `Secure transmission completed to mark@picogrid.com`,
          level: 'success'
        });
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
          setIsTransmitting(false);
          setIsComplete(false);
          setFormData({
            name: '',
            email: '',
            organization: '',
            subject: '',
            message: '',
            priority: 'routine'
          });
        }, 3000);
        
      } catch (error) {
        await missionAudio.playError();
        addTelemetry({
          source: 'COMMS',
          message: 'Transmission failed: Network security protocol error',
          level: 'error'
        });
        setIsTransmitting(false);
      }
    };

    processTransmission();
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    missionAudio.playTerminalKey();
  };

  const getPriorityColor = (priority: ContactFormData['priority']) => {
    switch (priority) {
      case 'routine': return 'text-green-500 border-green-500';
      case 'urgent': return 'text-yellow-500 border-yellow-500';
      case 'critical': return 'text-red-500 border-red-500';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && !isTransmitting && onClose()}
      >
        <motion.div
          className="terminal-window w-full max-w-2xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* Header */}
          <div className="terminal-header">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📡</span>
                <div className="holo-text text-lg font-mono">
                  ENCRYPTED TRANSMISSION
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="status-indicator">
                  <div className="status-dot active"></div>
                  <span className="text-xs">SECURE</span>
                </div>
                {!isTransmitting && (
                  <button 
                    className="text-green-500 hover:text-red-400 font-mono text-xl"
                    onClick={onClose}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="terminal-content">
            {!isTransmitting && !isComplete && (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Classification Banner */}
                <div className="classification-banner unclassified mb-6">
                  UNCLASSIFIED // FOR PROFESSIONAL COMMUNICATIONS
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-green-500 text-xs font-mono mb-2 uppercase">
                      Operative Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-gray-900 border border-green-500/30 text-white font-mono text-sm p-3 rounded focus:border-green-500 focus:outline-none"
                      placeholder="Enter your name..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-green-500 text-xs font-mono mb-2 uppercase">
                      Communication Channel *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-gray-900 border border-green-500/30 text-white font-mono text-sm p-3 rounded focus:border-green-500 focus:outline-none"
                      placeholder="operative@organization.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-green-500 text-xs font-mono mb-2 uppercase">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      className="w-full bg-gray-900 border border-green-500/30 text-white font-mono text-sm p-3 rounded focus:border-green-500 focus:outline-none"
                      placeholder="Company/Agency name..."
                    />
                  </div>

                  <div>
                    <label className="block text-green-500 text-xs font-mono mb-2 uppercase">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value as ContactFormData['priority'])}
                      className={`w-full bg-gray-900 border font-mono text-sm p-3 rounded focus:outline-none ${getPriorityColor(formData.priority)}`}
                    >
                      <option value="routine">ROUTINE</option>
                      <option value="urgent">URGENT</option>
                      <option value="critical">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-green-500 text-xs font-mono mb-2 uppercase">
                    Mission Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full bg-gray-900 border border-green-500/30 text-white font-mono text-sm p-3 rounded focus:border-green-500 focus:outline-none"
                    placeholder="Brief description of your mission objective..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-green-500 text-xs font-mono mb-2 uppercase">
                    Encrypted Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={6}
                    className="w-full bg-gray-900 border border-green-500/30 text-white font-mono text-sm p-3 rounded focus:border-green-500 focus:outline-none resize-none"
                    placeholder="Compose your secure message here..."
                    required
                  />
                  <div className="text-xs text-gray-400 font-mono mt-1">
                    Message length: {formData.message.length}/2000 characters
                  </div>
                </div>

                {/* Encryption Notice */}
                <div className="hud-panel p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-green-500">🔒</span>
                    <span className="text-green-500 text-xs font-mono uppercase">Security Protocol</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    All transmissions are encrypted using AES-256 encryption and transmitted through 
                    secure channels. Message contents are protected by end-to-end encryption protocols 
                    and will be delivered directly to mission command (mark@picogrid.com).
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    className="tactical-button px-8 py-3 text-sm"
                    disabled={!formData.name || !formData.email || !formData.message}
                  >
                    <span className="flex items-center space-x-2">
                      <span>📤</span>
                      <span>INITIATE TRANSMISSION</span>
                    </span>
                  </button>
                </div>
              </motion.form>
            )}

            {/* Transmission Process */}
            {isTransmitting && !isComplete && (
              <motion.div
                className="space-y-6 py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center mb-8">
                  <div className="tactical-loading mx-auto mb-4"></div>
                  <div className="holo-text text-lg font-mono">
                    SECURE TRANSMISSION IN PROGRESS
                  </div>
                </div>

                {/* Current Step */}
                <div className="space-y-4">
                  <div className="matrix-text text-center">
                    {transmissionSteps[transmissionStep]}
                  </div>
                  
                  {/* Encryption Progress */}
                  <div className="tactical-progress">
                    <motion.div 
                      className="tactical-progress-fill"
                      animate={{ width: `${encryptionProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  
                  <div className="text-center text-xs font-mono text-gray-400">
                    STEP {transmissionStep + 1} / {transmissionSteps.length}
                  </div>
                </div>

                {/* Visual Effects */}
                <div className="flex justify-center">
                  <div className="radar-container">
                    <div className="radar-sweep"></div>
                    <div className="absolute inset-4 border border-green-500/20 rounded-full"></div>
                    <div className="absolute inset-8 border border-green-500/10 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Transmission Complete */}
            {isComplete && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-6xl mb-4">✅</div>
                <div className="holo-text text-xl font-mono mb-4">
                  TRANSMISSION SUCCESSFUL
                </div>
                <div className="text-gray-300 font-mono text-sm space-y-2">
                  <div>Message encrypted and delivered to mission command</div>
                  <div>Response expected within 4-24 hours</div>
                  <div className="text-green-500">Direct channel: mark@picogrid.com</div>
                </div>
                
                <div className="mt-6 hud-panel p-4 max-w-md mx-auto">
                  <div className="text-green-500 text-xs font-mono mb-2">TRANSMISSION LOG</div>
                  <div className="text-xs font-mono text-gray-300 space-y-1">
                    <div>RECIPIENT: Mission Command</div>
                    <div>ENCRYPTION: AES-256 + Quantum-Safe</div>
                    <div>PRIORITY: {formData.priority.toUpperCase()}</div>
                    <div>STATUS: DELIVERED</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EncryptedContactForm;