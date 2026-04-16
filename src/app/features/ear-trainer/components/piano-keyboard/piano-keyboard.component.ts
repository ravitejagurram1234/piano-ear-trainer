import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Note,
  GuessResult,
  OctaveRange,
  WHITE_KEY_NAMES,
  BLACK_KEY_NAMES,
  BLACK_KEY_OFFSETS,
  buildNote,
  isSameNote,
  octaveArray,
} from '../../../../shared/models/note.model';

interface KeyViewModel {
  note: Note;
  isActive: boolean;   // currently highlighted (playing)
  isCorrect: boolean;  // correct-guess highlight
  isWrong: boolean;    // wrong-guess highlight
  canClick: boolean;
}

@Component({
  selector: 'app-piano-keyboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './piano-keyboard.component.html',
  styleUrl: './piano-keyboard.component.scss',
})
export class PianoKeyboardComponent implements OnChanges {
  @Input() range!: OctaveRange;
  @Input() includeBlackKeys = false;
  @Input() currentNote: Note | null = null;
  @Input() guessedNote: Note | null = null;
  @Input() guessResult: GuessResult = 'none';
  @Input() isRevealed = false;
  @Input() canGuess = false;

  @Output() noteGuessed = new EventEmitter<Note>();

  octaves: number[] = [];

  readonly WHITE_KEYS = [...WHITE_KEY_NAMES];
  readonly BLACK_KEYS = [...BLACK_KEY_NAMES];

  ngOnChanges(): void {
    this.octaves = octaveArray(this.range);
  }

  // ── Key factory ─────────────────────────────────────────────────────────────

  getWhiteKeys(octave: number): KeyViewModel[] {
    return this.WHITE_KEYS.map((name) => this.buildVM(buildNote(name, octave)));
  }

  getBlackKeys(octave: number): KeyViewModel[] {
    if (!this.includeBlackKeys) return [];
    return this.BLACK_KEYS.map((name) => this.buildVM(buildNote(name, octave)));
  }

  private buildVM(note: Note): KeyViewModel {
    const revealed = this.isRevealed && this.currentNote !== null;
    const isCurrent = this.currentNote !== null && isSameNote(note, this.currentNote);
    const isGuessed = this.guessedNote !== null && isSameNote(note, this.guessedNote);

    return {
      note,
      isActive:  revealed && isCurrent && this.guessResult === 'none',
      isCorrect: revealed && isCurrent && this.guessResult !== 'none',
      isWrong:   isGuessed && this.guessResult === 'incorrect' && !isCurrent,
      canClick:  this.canGuess,
    };
  }

  // ── Layout helpers ───────────────────────────────────────────────────────────

  /** Left offset for a black key in pixels, given a 48-px white-key width. */
  blackKeyLeft(noteName: string): string {
    const offset = BLACK_KEY_OFFSETS[noteName] ?? 0;
    return `calc(${offset} * var(--white-key-width))`;
  }

  trackByNote(_: number, vm: KeyViewModel): string {
    return vm.note.displayName;
  }

  // ── Interaction ──────────────────────────────────────────────────────────────

  onKeyClick(vm: KeyViewModel, event: MouseEvent): void {
    event.stopPropagation();
    if (!vm.canClick) return;
    this.noteGuessed.emit(vm.note);
  }
}
