# 🎹 Piano Ear Trainer

An enterprise-grade Angular 17 application for training musical pitch recognition across all 8 piano octaves.

## Features

- 🎵 **Synthesised Piano Sound** — Additive synthesis via Web Audio API with harmonic overtones for a realistic piano timbre
- 🎹 **Full Keyboard (Octaves 1–8)** — Visual piano keyboard that highlights the correct note on reveal
- 🎚️ **Octave Range Selector** — Choose any range from octave 1 to 8 using dual range sliders
- ♯♭ **Black Key Toggle** — Switch between white-keys-only (C D E F G A B) and chromatic (all 12 notes) modes
- 🎯 **Interactive Guessing** — Click directly on the keyboard key to submit your answer
- ✅ **Success Animation** — Confetti burst + expanding rings + chord fanfare on correct answers
- ❌ **Error Feedback** — Shake animation + error tone + correct note revealed on wrong answers
- 📊 **Live Scoring** — Correct / total, accuracy %, streak counter, best streak badge
- ♻️ **Replay Button** — Listen to the same note again before guessing
- 👁️ **Reveal Button** — Give up and see the answer (still counts against your score total)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 17 (standalone components, signals) |
| State | Angular Signals (`signal`, `computed`) |
| Styling | SCSS with CSS Custom Properties |
| Audio | Web Audio API (additive synthesis, ADSR) |
| Animations | @angular/animations + CSS keyframes |
| Build | esbuild via `@angular-devkit/build-angular:application` |

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       └── audio.service.ts        # Web Audio API piano synthesis
│   ├── shared/
│   │   └── models/
│   │       └── note.model.ts           # Note types, frequency math, utilities
│   ├── features/
│   │   └── ear-trainer/
│   │       ├── ear-trainer.component.* # Main page (signals-based state)
│   │       └── components/
│   │           ├── piano-keyboard/     # Visual + interactive piano
│   │           ├── controls-panel/     # Octave range + black key toggle
│   │           └── success-overlay/    # Confetti celebration
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
└── styles.scss                         # Global design tokens + reset
```

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
# Opens http://localhost:4200 automatically
```

### Production Build

```bash
npm run build
# Output in dist/piano-ear-trainer/
```

## How to Play

1. **Configure** your octave range and whether to include sharps/flats in the Settings panel
2. **Click "Play Note"** — a random note from your selected range is played
3. **Listen carefully**, then click the matching key on the piano keyboard
4. Watch for the **green glow + confetti** if correct, or **red shake + reveal** if wrong
5. Use **Replay** to hear the note again, or **Reveal** to give up on a round
6. Build your **streak** and track your **accuracy** in the header

## Note Frequency Formula

```
f(note, octave) = 261.626 × 2^((octave − 4) + semitone / 12)
```

Where `semitone` is 0 for C, 1 for C#, …, 11 for B.
This gives C4 (Middle C) = 261.626 Hz and A4 = 440 Hz (standard tuning).
