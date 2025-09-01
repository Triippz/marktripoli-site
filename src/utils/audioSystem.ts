/**
 * Mission Control Advanced Audio Feedback System
 * Implements tactical audio effects using WebAudio API
 */

interface AudioEffect {
  name: string;
  frequency: number;
  duration: number;
  type: 'beep' | 'sweep' | 'radar' | 'alert' | 'success' | 'error' | 'ambient';
  volume?: number;
}

class MissionControlAudio {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled = false;
  private ambientLoop: OscillatorNode | null = null;
  private effects: Map<string, AudioEffect> = new Map();

  constructor() {
    this.initializeEffects();
  }

  private initializeEffects() {
    // Define tactical sound effects
    const effectsData: AudioEffect[] = [
      { name: 'boot', frequency: 800, duration: 0.3, type: 'beep', volume: 0.4 },
      { name: 'engage', frequency: 1200, duration: 0.2, type: 'success', volume: 0.5 },
      { name: 'navigate', frequency: 600, duration: 0.1, type: 'beep', volume: 0.3 },
      { name: 'error', frequency: 200, duration: 0.5, type: 'error', volume: 0.6 },
      { name: 'alert', frequency: 1000, duration: 0.8, type: 'alert', volume: 0.5 },
      { name: 'radar', frequency: 440, duration: 2.0, type: 'radar', volume: 0.2 },
      { name: 'sweep', frequency: 300, duration: 1.5, type: 'sweep', volume: 0.3 },
      { name: 'terminal', frequency: 800, duration: 0.05, type: 'beep', volume: 0.2 },
      { name: 'map_pin', frequency: 1500, duration: 0.15, type: 'success', volume: 0.4 },
      { name: 'briefing', frequency: 900, duration: 0.25, type: 'beep', volume: 0.4 },
      { name: 'ambient', frequency: 60, duration: 10, type: 'ambient', volume: 0.1 }
    ];

    effectsData.forEach(effect => {
      this.effects.set(effect.name, effect);
    });
  }

  async initialize(): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.7; // Master volume

      // Resume audio context if suspended (required for user interaction)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isEnabled = true;
      console.log('[AUDIO] Mission Control Audio System initialized');
    } catch (error) {
      console.warn('[AUDIO] Failed to initialize audio system:', error);
      this.isEnabled = false;
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.ambientLoop) {
      this.stopAmbient();
    } else if (enabled && this.audioContext) {
      this.startAmbient();
    }
  }

  isAudioEnabled(): boolean {
    return this.isEnabled && this.audioContext !== null;
  }

  private createOscillator(frequency: number, type: OscillatorType = 'sine'): OscillatorNode {
    if (!this.audioContext) throw new Error('Audio context not initialized');
    if (!this.audioContext.currentTime && this.audioContext.currentTime !== 0) throw new Error('Audio context in invalid state');
    if (typeof frequency !== 'number' || isNaN(frequency) || frequency <= 0) {
      throw new Error(`Invalid frequency: ${frequency}`);
    }
    
    const oscillator = this.audioContext.createOscillator();
    
    // Validate oscillator frequency property exists before setting
    if (!oscillator.frequency || typeof oscillator.frequency.setValueAtTime !== 'function') {
      throw new Error('Oscillator frequency property unavailable');
    }
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;
    return oscillator;
  }

  private createEnvelope(duration: number, attack = 0.01, decay = 0.1, sustain = 0.7, release = 0.2): GainNode {
    if (!this.audioContext || !this.masterGain) throw new Error('Audio system not ready');

    const envelope = this.audioContext.createGain();
    envelope.connect(this.masterGain);

    const now = this.audioContext.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + attack);
    envelope.gain.linearRampToValueAtTime(sustain, now + attack + decay);
    envelope.gain.setValueAtTime(sustain, now + duration - release);
    envelope.gain.linearRampToValueAtTime(0, now + duration);

    return envelope;
  }

  async playEffect(effectName: string): Promise<void> {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    const effect = this.effects.get(effectName);
    if (!effect) {
      console.warn(`[AUDIO] Unknown effect: ${effectName}`);
      return;
    }

    // Validate effect object has required properties
    if (typeof effect.frequency !== 'number' || typeof effect.duration !== 'number') {
      console.warn(`[AUDIO] Invalid effect properties for ${effectName}:`, effect);
      return;
    }

    try {
      switch (effect.type) {
        case 'beep':
          this.playBeep(effect);
          break;
        case 'sweep':
          this.playSweep(effect);
          break;
        case 'radar':
          this.playRadar(effect);
          break;
        case 'alert':
          this.playAlert(effect);
          break;
        case 'success':
          this.playSuccess(effect);
          break;
        case 'error':
          this.playError(effect);
          break;
        default:
          this.playBeep(effect);
      }
    } catch (error) {
      console.warn(`[AUDIO] Failed to play effect ${effectName}:`, error);
    }
  }

  private playBeep(effect: AudioEffect): void {
    const oscillator = this.createOscillator(effect.frequency);
    const envelope = this.createEnvelope(effect.duration, 0.01, 0.05, 0.8, 0.1);
    
    if (effect.volume) {
      envelope.gain.value *= effect.volume;
    }

    oscillator.connect(envelope);
    oscillator.start();
    oscillator.stop(this.audioContext!.currentTime + effect.duration);
  }

  private playSweep(effect: AudioEffect): void {
    const oscillator = this.createOscillator(effect.frequency);
    const envelope = this.createEnvelope(effect.duration, 0.1, 0.2, 0.6, 0.3);

    // Frequency sweep
    const now = this.audioContext!.currentTime;
    oscillator.frequency.setValueAtTime(effect.frequency, now);
    oscillator.frequency.linearRampToValueAtTime(effect.frequency * 2, now + effect.duration);

    if (effect.volume) {
      envelope.gain.value *= effect.volume;
    }

    oscillator.connect(envelope);
    oscillator.start();
    oscillator.stop(now + effect.duration);
  }

  private playRadar(effect: AudioEffect): void {
    // Create pulsing radar sound
    const oscillator = this.createOscillator(effect.frequency, 'sine');
    const envelope = this.createEnvelope(effect.duration);
    const tremolo = this.audioContext!.createGain();

    // LFO for tremolo effect
    const lfo = this.createOscillator(4, 'sine'); // 4 Hz tremolo
    const lfoGain = this.audioContext!.createGain();
    lfoGain.gain.value = 0.5;

    lfo.connect(lfoGain);
    lfoGain.connect(tremolo.gain);
    tremolo.gain.value = 0.5;

    oscillator.connect(tremolo);
    tremolo.connect(envelope);

    if (effect.volume) {
      envelope.gain.value *= effect.volume;
    }

    const now = this.audioContext!.currentTime;
    lfo.start();
    oscillator.start();
    
    lfo.stop(now + effect.duration);
    oscillator.stop(now + effect.duration);
  }

  private playAlert(effect: AudioEffect): void {
    // Alternating high-low alert
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const freq = i % 2 === 0 ? effect.frequency : effect.frequency * 0.7;
        const oscillator = this.createOscillator(freq, 'square');
        const envelope = this.createEnvelope(0.2, 0.01, 0.02, 0.9, 0.1);
        
        if (effect.volume) {
          envelope.gain.value *= effect.volume;
        }

        oscillator.connect(envelope);
        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.2);
      }, i * 200);
    }
  }

  private playSuccess(effect: AudioEffect): void {
    // Ascending success tone
    const oscillator1 = this.createOscillator(effect.frequency);
    const oscillator2 = this.createOscillator(effect.frequency * 1.25);
    const envelope1 = this.createEnvelope(effect.duration * 0.6);
    const envelope2 = this.createEnvelope(effect.duration * 0.4);

    if (effect.volume) {
      envelope1.gain.value *= effect.volume * 0.7;
      envelope2.gain.value *= effect.volume * 0.5;
    }

    oscillator1.connect(envelope1);
    oscillator2.connect(envelope2);

    const now = this.audioContext!.currentTime;
    oscillator1.start();
    oscillator2.start(now + effect.duration * 0.3);
    
    oscillator1.stop(now + effect.duration * 0.6);
    oscillator2.stop(now + effect.duration);
  }

  private playError(effect: AudioEffect): void {
    // Harsh error sound
    const oscillator = this.createOscillator(effect.frequency, 'sawtooth');
    const envelope = this.createEnvelope(effect.duration, 0.001, 0.1, 0.3, 0.4);
    
    // Add distortion
    const waveshaper = this.audioContext!.createWaveShaper();
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + 50) * x * 20 * deg) / (Math.PI + 50 * Math.abs(x));
    }
    
    waveshaper.curve = curve;
    waveshaper.oversample = '4x';

    if (effect.volume) {
      envelope.gain.value *= effect.volume;
    }

    oscillator.connect(waveshaper);
    waveshaper.connect(envelope);
    oscillator.start();
    oscillator.stop(this.audioContext!.currentTime + effect.duration);
  }

  startAmbient(): void {
    if (!this.isEnabled || !this.audioContext || !this.masterGain || this.ambientLoop) return;

    try {
      // Create subtle ambient loop
      const oscillator1 = this.createOscillator(60, 'sine');
      const oscillator2 = this.createOscillator(90, 'sine');
      const ambientGain = this.audioContext.createGain();
      
      ambientGain.gain.value = 0.05; // Very quiet
      ambientGain.connect(this.masterGain);

      oscillator1.connect(ambientGain);
      oscillator2.connect(ambientGain);

      // Add LFO for subtle modulation
      const lfo = this.createOscillator(0.1, 'sine');
      const lfoGain = this.audioContext.createGain();
      lfoGain.gain.value = 5;
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator1.frequency);

      lfo.start();
      oscillator1.start();
      oscillator2.start();

      this.ambientLoop = oscillator1; // Store reference for cleanup
      
      console.log('[AUDIO] Ambient loop started');
    } catch (error) {
      console.warn('[AUDIO] Failed to start ambient loop:', error);
    }
  }

  stopAmbient(): void {
    if (this.ambientLoop) {
      try {
        this.ambientLoop.stop();
        this.ambientLoop = null;
        console.log('[AUDIO] Ambient loop stopped');
      } catch (error) {
        console.warn('[AUDIO] Error stopping ambient loop:', error);
      }
    }
  }

  // Generic play method for backward compatibility
  async play(effectName: string): Promise<void> {
    await this.playEffect(effectName);
  }

  // Convenience methods for common actions
  async playTerminalKey(): Promise<void> {
    await this.playEffect('terminal');
  }

  async playMapPin(): Promise<void> {
    await this.playEffect('map_pin');
  }

  async playEngagement(): Promise<void> {
    await this.playEffect('engage');
  }

  async playNavigation(): Promise<void> {
    await this.playEffect('navigate');
  }

  async playBootup(): Promise<void> {
    await this.playEffect('boot');
  }

  async playBriefing(): Promise<void> {
    await this.playEffect('briefing');
  }

  // Cleanup
  destroy(): void {
    this.stopAmbient();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.masterGain = null;
    this.isEnabled = false;
  }
}

// Global instance
export const missionAudio = new MissionControlAudio();

// Auto-initialize on first user interaction
let autoInitialized = false;
const autoInitialize = async () => {
  if (!autoInitialized && !missionAudio.isAudioEnabled()) {
    await missionAudio.initialize();
    autoInitialized = true;
  }
};

// Add event listeners for user interaction
if (typeof window !== 'undefined') {
  ['click', 'keydown', 'touchstart'].forEach(event => {
    window.addEventListener(event, autoInitialize, { once: true });
  });
}

export default missionAudio;