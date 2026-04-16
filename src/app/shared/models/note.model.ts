/**
 * Note Model — Core domain types and utilities for the Piano Ear Trainer.
 *
 * Frequency formula (equal temperament):
 *   f(note, octave) = 261.626 × 2^((octave − 4) + semitone/12)
 * where semitone is 0 for C, 1 for C#, …, 11 for B.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const WHITE_KEY_NAMES  = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export const BLACK_KEY_NAMES  = ['C#', 'D#', 'F#', 'G#', 'A#'] as const;

export const MIN_OCTAVE = 1;
export const MAX_OCTAVE = 8;

/** Absolute left-offset of black keys within one octave (in white-key-width units). */
export const BLACK_KEY_OFFSETS: Record<string, number> = {
  'C#': 0.667,
  'D#': 1.667,
  'F#': 3.667,
  'G#': 4.667,
  'A#': 5.667,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type NoteName = typeof CHROMATIC_NOTES[number];

export interface Note {
  /** Note name, e.g. 'C', 'F#' */
  readonly name: string;
  /** Octave number (1–8) */
  readonly octave: number;
  /** Frequency in Hz */
  readonly frequency: number;
  /** true for C#, D#, F#, G#, A# */
  readonly isBlackKey: boolean;
  /** Human-readable display string, e.g. 'F#4' */
  readonly displayName: string;
  /** Semitone index within octave (0 = C, 11 = B) */
  readonly semitone: number;
}

export type GuessResult = 'none' | 'correct' | 'incorrect';

export interface OctaveRange {
  min: number;
  max: number;
}

export interface GameScore {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

// ── Factory helpers ────────────────────────────────────────────────────────────

/** Calculate frequency for a given note name and octave. */
export function getNoteFrequency(noteName: string, octave: number): number {
  const semitone = CHROMATIC_NOTES.indexOf(noteName as NoteName);
  // C4 = 261.626 Hz
  return 261.626 * Math.pow(2, (octave - 4) + semitone / 12);
}

/** Build a Note object from name and octave. */
export function buildNote(noteName: string, octave: number): Note {
  return {
    name:        noteName,
    octave,
    frequency:   getNoteFrequency(noteName, octave),
    isBlackKey:  (BLACK_KEY_NAMES as readonly string[]).includes(noteName),
    displayName: `${noteName}${octave}`,
    semitone:    CHROMATIC_NOTES.indexOf(noteName as NoteName),
  };
}

/** Return all selectable notes for a given range and black-key setting. */
export function getAvailableNotes(range: OctaveRange, includeBlackKeys: boolean): Note[] {
  const names = includeBlackKeys ? CHROMATIC_NOTES : WHITE_KEY_NAMES;
  const notes: Note[] = [];

  for (let oct = range.min; oct <= range.max; oct++) {
    for (const name of names) {
      notes.push(buildNote(name, oct));
    }
  }
  return notes;
}

/** Pick a uniformly random note from the available set. */
export function pickRandomNote(range: OctaveRange, includeBlackKeys: boolean): Note {
  const pool = getAvailableNotes(range, includeBlackKeys);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Check whether two notes refer to the same pitch. */
export function isSameNote(a: Note, b: Note): boolean {
  return a.name === b.name && a.octave === b.octave;
}

/** Return an array of all octave numbers in a range. */
export function octaveArray(range: OctaveRange): number[] {
  return Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i);
}
