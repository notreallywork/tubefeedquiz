import { useRef, useCallback, useEffect } from 'react';

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

interface ToneParams {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  volume?: number;
}

function playTone({ 
  frequency, 
  duration, 
  type = 'sine', 
  attack = 0.01, 
  decay = 0.1, 
  sustain = 0.7, 
  release = 0.2, 
  volume = 0.3 
}: ToneParams) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
  gain.gain.exponentialRampToValueAtTime(volume * sustain, ctx.currentTime + attack + decay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + duration + release);
}

function playChord(frequencies: number[], duration: number, volume = 0.3) {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  frequencies.forEach((freq, i) => {
    setTimeout(() => {
      playTone({ frequency: freq, duration, volume: volume / frequencies.length });
    }, i * 50);
  });
}

function playArpeggio(frequencies: number[], noteDuration: number, volume = 0.3) {
  frequencies.forEach((freq, i) => {
    setTimeout(() => {
      playTone({ frequency: freq, duration: noteDuration, volume });
    }, i * 150);
  });
}

export function useAudio(soundEnabled: boolean) {
  const ambientOscRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }, []);

  // Ambient sound for attract mode
  const startAmbient = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Stop existing ambient
    if (ambientOscRef.current) {
      ambientOscRef.current.stop();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    
    // Tremolo effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.02, ctx.currentTime);
    lfoGain.gain.setValueAtTime(3, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    
    ambientOscRef.current = osc;
    ambientGainRef.current = gain;
  }, [soundEnabled]);

  const stopAmbient = useCallback(() => {
    if (ambientOscRef.current) {
      ambientOscRef.current.stop();
      ambientOscRef.current = null;
    }
    if (ambientGainRef.current) {
      ambientGainRef.current = null;
    }
  }, []);

  // Sound effects
  const playStartSound = useCallback(() => {
    if (!soundEnabled) return;
    // Ascending triad: C4 → E4 → G4
    playArpeggio([261.63, 329.63, 392.00], 0.3, 0.4);
  }, [soundEnabled]);

  const playSelectionSound = useCallback(() => {
    if (!soundEnabled) return;
    // 800Hz click
    playTone({ frequency: 800, duration: 0.05, volume: 0.2 });
  }, [soundEnabled]);

  const playCorrectSound = useCallback(() => {
    if (!soundEnabled) return;
    // Major chord: C5 + E5 + G5 + C6
    playChord([523.25, 659.25, 783.99, 1046.50], 0.5, 0.4);
  }, [soundEnabled]);

  const playPartialSound = useCallback(() => {
    if (!soundEnabled) return;
    // E5 with vibrato feel - use two slightly detuned oscillators
    playTone({ frequency: 659.25, duration: 0.4, volume: 0.3 });
    setTimeout(() => {
      playTone({ frequency: 662, duration: 0.4, volume: 0.2 });
    }, 20);
  }, [soundEnabled]);

  const playIncorrectSound = useCallback(() => {
    if (!soundEnabled) return;
    // A3, low and neutral
    playTone({ frequency: 220, duration: 0.3, volume: 0.3 });
  }, [soundEnabled]);

  const playTimerTick = useCallback((urgent = false) => {
    if (!soundEnabled) return;
    // 1000Hz click, 1200Hz when urgent
    playTone({ frequency: urgent ? 1200 : 1000, duration: 0.02, volume: 0.15 });
  }, [soundEnabled]);

  const playTimerExpire = useCallback(() => {
    if (!soundEnabled) return;
    // Descending slide: G4 to C4
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(392, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(261.63, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, [soundEnabled]);

  const playScoreReveal = useCallback(() => {
    if (!soundEnabled) return;
    // Arpeggio: C5 → E5 → G5 → B5 → C6
    playArpeggio([523.25, 659.25, 783.99, 987.77, 1046.50], 0.3, 0.4);
  }, [soundEnabled]);

  const playLeaderboardFanfare = useCallback(() => {
    if (!soundEnabled) return;
    // C5-G5-C6-E6-G6 triumphant
    playChord([523.25, 783.99, 1046.50, 1318.51, 1567.98], 2, 0.4);
  }, [soundEnabled]);

  const playDragStart = useCallback(() => {
    if (!soundEnabled) return;
    // Subtle 200Hz tone
    playTone({ frequency: 200, duration: 0.1, volume: 0.15 });
  }, [soundEnabled]);

  const playDropSuccess = useCallback(() => {
    if (!soundEnabled) return;
    // C6 bell tone with delay repeat
    playTone({ frequency: 1046.50, duration: 0.2, volume: 0.3 });
    setTimeout(() => {
      playTone({ frequency: 1046.50, duration: 0.15, volume: 0.2 });
    }, 100);
  }, [soundEnabled]);

  const playDropFail = useCallback(() => {
    if (!soundEnabled) return;
    // Low slide: G3 to C3
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(196, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(130.81, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, [soundEnabled]);

  const playConfirmSound = useCallback(() => {
    if (!soundEnabled) return;
    // Short confirmation beep
    playTone({ frequency: 600, duration: 0.1, volume: 0.25 });
  }, [soundEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, [stopAmbient]);

  return {
    initAudio,
    startAmbient,
    stopAmbient,
    playStartSound,
    playSelectionSound,
    playCorrectSound,
    playPartialSound,
    playIncorrectSound,
    playTimerTick,
    playTimerExpire,
    playScoreReveal,
    playLeaderboardFanfare,
    playDragStart,
    playDropSuccess,
    playDropFail,
    playConfirmSound
  };
}
