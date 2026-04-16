import { Injectable } from '@angular/core';

/**
 * AudioService — Piano synthesis via Web Audio API.
 *
 * Uses additive synthesis with multiple harmonics and ADSR envelopes to
 * produce a piano-like timbre that is clearly identifiable across all 8 octaves.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx: AudioContext | null = null;

  // ── Context lifecycle ────────────────────────────────────────────────────────

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // ── Internal helpers ─────────────────────────────────────────────────────────

  private createHarmonicOscillator(
    ctx: AudioContext,
    destination: AudioNode,
    frequency: number,
    gainAmount: number,
    type: OscillatorType,
    duration: number,
  ): void {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Piano-style ADSR: near-instant attack, quick decay to lower sustain, long release
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(gainAmount, ctx.currentTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(gainAmount * 0.45, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(gainAmount * 0.25, ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.05);
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /**
   * Play a piano note at the given frequency.
   * @param frequency  Frequency in Hz
   * @param duration   Approximate sustain + release duration in seconds (default 2.5)
   */
  playNote(frequency: number, duration = 2.5): void {
    const ctx    = this.getContext();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.55, ctx.currentTime);
    master.connect(ctx.destination);

    // Harmonic series approximating a piano's resonance
    const harmonics: Array<{ mult: number; gain: number; type: OscillatorType }> = [
      { mult: 1,  gain: 1.00,  type: 'triangle' },
      { mult: 2,  gain: 0.55,  type: 'sine'     },
      { mult: 3,  gain: 0.28,  type: 'sine'     },
      { mult: 4,  gain: 0.14,  type: 'sine'     },
      { mult: 5,  gain: 0.08,  type: 'sine'     },
      { mult: 6,  gain: 0.05,  type: 'sine'     },
      { mult: 8,  gain: 0.03,  type: 'sine'     },
      { mult: 10, gain: 0.015, type: 'sine'     },
    ];

    harmonics.forEach(({ mult, gain, type }) => {
      this.createHarmonicOscillator(ctx, master, frequency * mult, gain, type, duration);
    });
  }

  /**
   * Play a short ascending arpeggio chord to celebrate a correct guess.
   */
  playSuccessChord(): void {
    // C5 – E5 – G5 – C6  (ascending major arpeggio)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
      setTimeout(() => this.playNote(f, 0.45), i * 130);
    });
  }

  /**
   * Play a short low-pitch descending tone for an incorrect guess.
   */
  playErrorTone(): void {
    const ctx  = this.getContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  }

  /**
   * Suspend the AudioContext (e.g., when tab loses focus) to save resources.
   */
  suspend(): void {
    this.ctx?.suspend();
  }
}
