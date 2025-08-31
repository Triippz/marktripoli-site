// Enhanced feedback system for Mission Control interface

export interface FeedbackConfig {
  audio: boolean;
  haptic: boolean;
  visual: boolean;
}

export type FeedbackType = 
  | 'target_acquired'
  | 'target_engaged'
  | 'system_boot'
  | 'data_received'
  | 'command_executed'
  | 'error_occurred'
  | 'mission_complete'
  | 'alert_critical'
  | 'link_established'
  | 'transmission_sent';

class MissionControlFeedback {
  private audioContext: AudioContext | null = null;
  private config: FeedbackConfig = {
    audio: false,
    haptic: true,
    visual: true
  };

  constructor() {
    this.initializeAudio();
  }

  setConfig(config: Partial<FeedbackConfig>) {
    this.config = { ...this.config, ...config };
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  // Generate tactical audio feedback
  private generateTone(
    frequency: number, 
    duration: number, 
    type: OscillatorType = 'sine',
    volume: number = 0.1
  ) {
    if (!this.audioContext || !this.config.audio) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Haptic feedback simulation
  private triggerHaptic(pattern: number[]) {
    if (!this.config.haptic || !navigator.vibrate) return;
    navigator.vibrate(pattern);
  }

  // Visual feedback effects
  private createVisualEffect(element: HTMLElement, effect: string) {
    if (!this.config.visual) return;

    switch (effect) {
      case 'pulse':
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'pulse 0.3s ease-out';
        break;
      
      case 'flash':
        element.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.8)';
        setTimeout(() => {
          element.style.boxShadow = '';
        }, 200);
        break;
      
      case 'shake':
        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = 'shake 0.5s ease-in-out';
        break;
    }
  }

  // Main feedback trigger method
  trigger(type: FeedbackType, element?: HTMLElement) {
    switch (type) {
      case 'target_acquired':
        this.generateTone(800, 0.1, 'sine');
        this.triggerHaptic([50]);
        if (element) this.createVisualEffect(element, 'pulse');
        break;

      case 'target_engaged':
        // Triple beep sequence
        this.generateTone(1000, 0.08, 'square');
        setTimeout(() => this.generateTone(1200, 0.08, 'square'), 100);
        setTimeout(() => this.generateTone(1400, 0.12, 'square'), 200);
        this.triggerHaptic([100, 50, 100]);
        if (element) this.createVisualEffect(element, 'flash');
        break;

      case 'system_boot':
        // Rising tone sequence
        [440, 550, 660, 880].forEach((freq, index) => {
          setTimeout(() => this.generateTone(freq, 0.15, 'triangle', 0.05), index * 150);
        });
        this.triggerHaptic([200, 100, 200]);
        break;

      case 'data_received':
        this.generateTone(1800, 0.05, 'sawtooth', 0.03);
        this.triggerHaptic([30]);
        break;

      case 'command_executed':
        this.generateTone(600, 0.08, 'triangle');
        this.triggerHaptic([40]);
        if (element) this.createVisualEffect(element, 'pulse');
        break;

      case 'error_occurred':
        // Error buzzer
        this.generateTone(200, 0.3, 'sawtooth', 0.08);
        this.triggerHaptic([500]);
        if (element) this.createVisualEffect(element, 'shake');
        break;

      case 'mission_complete':
        // Victory fanfare
        const melody = [523, 659, 783, 1047];
        melody.forEach((freq, index) => {
          setTimeout(() => this.generateTone(freq, 0.3, 'triangle', 0.06), index * 200);
        });
        this.triggerHaptic([100, 50, 100, 50, 200]);
        break;

      case 'alert_critical':
        // Alternating alarm
        const alarm = () => {
          this.generateTone(800, 0.2, 'square', 0.1);
          setTimeout(() => this.generateTone(400, 0.2, 'square', 0.1), 200);
        };
        alarm();
        setTimeout(alarm, 400);
        this.triggerHaptic([200, 100, 200, 100, 200]);
        break;

      case 'link_established':
        // Connection handshake tones
        this.generateTone(300, 0.1, 'sine');
        setTimeout(() => this.generateTone(600, 0.1, 'sine'), 150);
        this.triggerHaptic([80, 40, 80]);
        break;

      case 'transmission_sent':
        // Radio transmission effect
        this.generateTone(2000, 0.05, 'sawtooth', 0.04);
        setTimeout(() => this.generateTone(1500, 0.08, 'triangle', 0.05), 100);
        this.triggerHaptic([60, 30, 60]);
        break;
    }
  }

  // Create complex feedback sequences
  playSequence(sequence: { type: FeedbackType; delay: number; element?: HTMLElement }[]) {
    sequence.forEach(({ type, delay, element }) => {
      setTimeout(() => this.trigger(type, element), delay);
    });
  }

  // Environmental audio effects
  playAmbientLoop(type: 'radar' | 'computer' | 'radio', volume: number = 0.02) {
    if (!this.audioContext || !this.config.audio) return;

    switch (type) {
      case 'radar':
        // Radar sweep sound
        setInterval(() => {
          this.generateTone(1200, 0.3, 'sine', volume);
          setTimeout(() => this.generateTone(800, 0.1, 'sine', volume * 0.5), 300);
        }, 4000);
        break;

      case 'computer':
        // Computer processing sounds
        setInterval(() => {
          if (Math.random() > 0.7) {
            this.generateTone(2400 + Math.random() * 400, 0.02, 'sawtooth', volume);
          }
        }, 500);
        break;

      case 'radio':
        // Radio static
        setInterval(() => {
          if (Math.random() > 0.8) {
            this.generateTone(150 + Math.random() * 100, 0.05, 'sawtooth', volume * 0.3);
          }
        }, 200);
        break;
    }
  }

  // Cleanup method
  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Export singleton instance
export const feedbackSystem = new MissionControlFeedback();

// CSS animations for visual feedback
export const feedbackAnimations = `
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@keyframes flash {
  0% { box-shadow: 0 0 5px rgba(0, 255, 0, 0.3); }
  50% { box-shadow: 0 0 25px rgba(0, 255, 0, 0.8); }
  100% { box-shadow: 0 0 5px rgba(0, 255, 0, 0.3); }
}
`;

// React hook for easy feedback integration
import { useCallback } from 'react';

export function useFeedback() {
  const setAudioEnabled = useCallback((enabled: boolean) => {
    feedbackSystem.setConfig({ audio: enabled });
  }, []);

  const setHapticEnabled = useCallback((enabled: boolean) => {
    feedbackSystem.setConfig({ haptic: enabled });
  }, []);

  const trigger = useCallback((type: FeedbackType, element?: HTMLElement) => {
    feedbackSystem.trigger(type, element);
  }, []);

  const playSequence = useCallback((
    sequence: { type: FeedbackType; delay: number; element?: HTMLElement }[]
  ) => {
    feedbackSystem.playSequence(sequence);
  }, []);

  return {
    trigger,
    playSequence,
    setAudioEnabled,
    setHapticEnabled
  };
}