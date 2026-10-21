/**
 * Synthesizes gentle audio cues and quiet background focus tones
 * entirely via the Web Audio API without external file dependencies.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private isAmbientPlaying = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Gentle bell chime for completed timer or solve
  playGentleChime() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio chime disabled or blocked by browser policy');
    }
  }

  // Soft click feedback
  playSoftTap() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // Toggle ambient quiet cafe white-pink noise
  toggleAmbientCafe(): boolean {
    const ctx = this.getContext();

    if (this.isAmbientPlaying && this.noiseNode) {
      try {
        (this.noiseNode as any).stop?.();
        this.noiseNode.disconnect();
      } catch (e) {}
      this.noiseNode = null;
      this.isAmbientPlaying = false;
      return false;
    }

    try {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink noise algorithm for calm cafe background murmur
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Lowpass filter to keep it very soft and warm
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      const gain = ctx.createGain();
      gain.gain.value = 0.07;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      this.noiseNode = noise;
      this.isAmbientPlaying = true;
      return true;
    } catch (e) {
      console.warn('Ambient focus sound error:', e);
      return false;
    }
  }

  getIsAmbientPlaying(): boolean {
    return this.isAmbientPlaying;
  }
}

export const sound = new AudioService();
