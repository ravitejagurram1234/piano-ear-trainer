import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';

import { AudioService } from '../../core/services/audio.service';
import { PianoKeyboardComponent } from './components/piano-keyboard/piano-keyboard.component';
import { ControlsPanelComponent } from './components/controls-panel/controls-panel.component';
import { SuccessOverlayComponent } from './components/success-overlay/success-overlay.component';

import {
  Note,
  GuessResult,
  OctaveRange,
  GameScore,
  pickRandomNote,
  isSameNote,
} from '../../shared/models/note.model';

@Component({
  selector: 'app-ear-trainer',
  standalone: true,
  imports: [
    CommonModule,
    PianoKeyboardComponent,
    ControlsPanelComponent,
    SuccessOverlayComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ear-trainer.component.html',
  styleUrl: './ear-trainer.component.scss',
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-12px)' }),
        animate('280ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' })),
      ]),
    ]),
    trigger('shake', [
      transition('false => true', [
        animate(
          '500ms ease',
          keyframes([
            style({ transform: 'translateX(0)',    offset: 0    }),
            style({ transform: 'translateX(-10px)', offset: 0.15 }),
            style({ transform: 'translateX(10px)',  offset: 0.30 }),
            style({ transform: 'translateX(-8px)',  offset: 0.45 }),
            style({ transform: 'translateX(8px)',   offset: 0.60 }),
            style({ transform: 'translateX(-4px)',  offset: 0.75 }),
            style({ transform: 'translateX(4px)',   offset: 0.88 }),
            style({ transform: 'translateX(0)',     offset: 1    }),
          ])
        ),
      ]),
    ]),
    trigger('popIn', [
      transition(':enter', [
        style({ transform: 'scale(0.85)', opacity: 0 }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class EarTrainerComponent implements OnInit, OnDestroy {
  private readonly audio = inject(AudioService);

  // ── Game state (signals) ─────────────────────────────────────────────────────

  range          = signal<OctaveRange>({ min: 3, max: 5 });
  includeBlackKeys = signal(false);

  currentNote    = signal<Note | null>(null);
  guessedNote    = signal<Note | null>(null);
  guessResult    = signal<GuessResult>('none');
  isRevealed     = signal(false);
  isPlaying      = signal(false);
  showSuccess    = signal(false);
  isShaking      = signal(false);

  score = signal<GameScore>({ correct: 0, total: 0, streak: 0, bestStreak: 0 });

  // ── Computed ─────────────────────────────────────────────────────────────────

  accuracy = computed(() => {
    const { correct, total } = this.score();
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  });

  canGuess = computed(
    () => this.currentNote() !== null && this.guessResult() === 'none'
  );

  hasPlayed = computed(() => this.currentNote() !== null);

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.audio.suspend();
  }

  // ── Settings handlers ────────────────────────────────────────────────────────

  onRangeChange(newRange: OctaveRange): void {
    this.range.set(newRange);
    this.resetRound();
  }

  onBlackKeyToggle(include: boolean): void {
    this.includeBlackKeys.set(include);
    this.resetRound();
  }

  // ── Game actions ─────────────────────────────────────────────────────────────

  playNote(): void {
    if (this.isPlaying()) return;

    this.resetRound();
    const note = pickRandomNote(this.range(), this.includeBlackKeys());
    this.currentNote.set(note);
    this.isPlaying.set(true);

    this.audio.playNote(note.frequency);

    // Unlock the "playing" state after note decay
    setTimeout(() => this.isPlaying.set(false), 2500);
  }

  replayNote(): void {
    const note = this.currentNote();
    if (!note || this.isPlaying()) return;

    this.isPlaying.set(true);
    this.audio.playNote(note.frequency);
    setTimeout(() => this.isPlaying.set(false), 2500);
  }

  revealAnswer(): void {
    this.isRevealed.set(true);
  }

  onNoteGuessed(guessed: Note): void {
    if (!this.canGuess()) return;

    const correct = this.currentNote()!;
    this.guessedNote.set(guessed);

    const isCorrect = isSameNote(guessed, correct);

    this.score.update((s) => ({
      correct:    s.correct + (isCorrect ? 1 : 0),
      total:      s.total + 1,
      streak:     isCorrect ? s.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(s.bestStreak, s.streak + 1) : s.bestStreak,
    }));

    if (isCorrect) {
      this.guessResult.set('correct');
      this.isRevealed.set(true);
      this.showSuccess.set(true);
      this.audio.playSuccessChord();

      setTimeout(() => this.showSuccess.set(false), 2200);
    } else {
      this.guessResult.set('incorrect');
      this.isRevealed.set(true);
      this.isShaking.set(true);
      this.audio.playErrorTone();

      setTimeout(() => this.isShaking.set(false), 550);
    }
  }

  resetGame(): void {
    this.resetRound();
    this.score.set({ correct: 0, total: 0, streak: 0, bestStreak: 0 });
  }

  // ── Private helpers ───────────────────────────────────────────────────────────

  private resetRound(): void {
    this.currentNote.set(null);
    this.guessedNote.set(null);
    this.guessResult.set('none');
    this.isRevealed.set(false);
    this.showSuccess.set(false);
    this.isShaking.set(false);
    this.isPlaying.set(false);
  }
}
