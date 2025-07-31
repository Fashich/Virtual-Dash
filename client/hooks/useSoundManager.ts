import { useState, useEffect, useRef } from 'react';

type SoundType = 'coin' | 'diamond' | 'jump' | 'crash' | 'powerup' | 'background' | 'button';

interface SoundTrack {
  audio: HTMLAudioElement;
  volume: number;
  loop: boolean;
}

class SoundManager {
  private sounds: Map<SoundType, SoundTrack> = new Map();
  private masterVolume: number = 0.7;
  private enabled: boolean = true;
  private backgroundMusic: HTMLAudioElement | null = null;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Since we don't have actual audio files, we'll create placeholder Web Audio API sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create synthetic sounds for demo purposes
    this.createSyntheticSound('coin', 800, 0.1, 'sine');
    this.createSyntheticSound('diamond', 1200, 0.15, 'triangle');
    this.createSyntheticSound('jump', 400, 0.1, 'square');
    this.createSyntheticSound('crash', 150, 0.3, 'sawtooth');
    this.createSyntheticSound('powerup', 600, 0.2, 'sine');
    this.createSyntheticSound('button', 500, 0.05, 'triangle');
  }

  private createSyntheticSound(type: SoundType, frequency: number, duration: number, waveType: OscillatorType) {
    // Create a simple synthetic sound using Web Audio API
    const createAudio = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = waveType;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      return { oscillator, gainNode, audioContext, duration };
    };

    // Create a mock HTMLAudioElement for consistency
    const mockAudio = {
      play: () => {
        if (!this.enabled) return Promise.resolve();
        
        try {
          const { oscillator, audioContext, duration } = createAudio();
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
          return Promise.resolve();
        } catch (error) {
          console.warn('Audio playback failed:', error);
          return Promise.resolve();
        }
      },
      pause: () => {},
      currentTime: 0,
      volume: 1,
      loop: false,
    } as HTMLAudioElement;

    this.sounds.set(type, {
      audio: mockAudio,
      volume: 1,
      loop: false,
    });
  }

  play(type: SoundType) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(type);
    if (sound) {
      sound.audio.volume = sound.volume * this.masterVolume;
      sound.audio.play().catch(error => {
        console.warn('Sound playback failed:', error);
      });
    }
  }

  setVolume(type: SoundType, volume: number) {
    const sound = this.sounds.get(type);
    if (sound) {
      sound.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    this.stopBackgroundMusic();
  }

  isEnabled() {
    return this.enabled;
  }

  playBackgroundMusic() {
    if (!this.enabled || this.backgroundMusic) return;

    // Create a simple background ambient sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator1.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(330, audioContext.currentTime);
      oscillator1.type = 'sine';
      oscillator2.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0.1 * this.masterVolume, audioContext.currentTime);
      
      oscillator1.start();
      oscillator2.start();

      // Store reference for cleanup
      this.backgroundMusic = {
        stop: () => {
          oscillator1.stop();
          oscillator2.stop();
        }
      } as any;
    } catch (error) {
      console.warn('Background music failed to start:', error);
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic = null;
    }
  }
}

let soundManagerInstance: SoundManager | null = null;

export function useSoundManager() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [masterVolume, setMasterVolumeState] = useState(0.7);
  const managerRef = useRef<SoundManager | null>(null);

  useEffect(() => {
    if (!managerRef.current) {
      if (!soundManagerInstance) {
        soundManagerInstance = new SoundManager();
      }
      managerRef.current = soundManagerInstance;
    }
  }, []);

  const play = (type: SoundType) => {
    managerRef.current?.play(type);
  };

  const setVolume = (type: SoundType, volume: number) => {
    managerRef.current?.setVolume(type, volume);
  };

  const setMasterVolume = (volume: number) => {
    managerRef.current?.setMasterVolume(volume);
    setMasterVolumeState(volume);
  };

  const enable = () => {
    managerRef.current?.enable();
    setIsEnabled(true);
  };

  const disable = () => {
    managerRef.current?.disable();
    setIsEnabled(false);
  };

  const toggle = () => {
    if (isEnabled) {
      disable();
    } else {
      enable();
    }
  };

  const playBackgroundMusic = () => {
    managerRef.current?.playBackgroundMusic();
  };

  const stopBackgroundMusic = () => {
    managerRef.current?.stopBackgroundMusic();
  };

  return {
    play,
    setVolume,
    setMasterVolume,
    enable,
    disable,
    toggle,
    isEnabled,
    masterVolume,
    playBackgroundMusic,
    stopBackgroundMusic,
  };
}

export type { SoundType };
