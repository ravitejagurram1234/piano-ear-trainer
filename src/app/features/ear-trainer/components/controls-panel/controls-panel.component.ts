import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OctaveRange, MIN_OCTAVE, MAX_OCTAVE } from '../../../../shared/models/note.model';

@Component({
  selector: 'app-controls-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './controls-panel.component.html',
  styleUrl: './controls-panel.component.scss',
})
export class ControlsPanelComponent {
  @Input() range: OctaveRange = { min: 3, max: 5 };
  @Input() includeBlackKeys = false;

  @Output() rangeChange       = new EventEmitter<OctaveRange>();
  @Output() blackKeyToggle    = new EventEmitter<boolean>();

  readonly minOctave = MIN_OCTAVE;
  readonly maxOctave = MAX_OCTAVE;

  /** Array [1..8] for range-fill visualization */
  get octaveArray(): number[] {
    return Array.from({ length: MAX_OCTAVE - MIN_OCTAVE + 1 }, (_, i) => i + MIN_OCTAVE);
  }

  onMinChange(raw: string | number): void {
    const val = Number(raw);
    const newMin = Math.min(val, this.range.max);
    this.rangeChange.emit({ min: newMin, max: this.range.max });
  }

  onMaxChange(raw: string | number): void {
    const val = Number(raw);
    const newMax = Math.max(val, this.range.min);
    this.rangeChange.emit({ min: this.range.min, max: newMax });
  }

  onBlackKeyToggle(): void {
    this.blackKeyToggle.emit(!this.includeBlackKeys);
  }

  isInRange(octave: number): boolean {
    return octave >= this.range.min && octave <= this.range.max;
  }

  /** Width percentage for the range-fill bar. */
  get fillLeft(): number {
    return ((this.range.min - MIN_OCTAVE) / (MAX_OCTAVE - MIN_OCTAVE)) * 100;
  }

  get fillWidth(): number {
    return ((this.range.max - this.range.min) / (MAX_OCTAVE - MIN_OCTAVE)) * 100;
  }

  noteCount(): number {
    const octaves  = this.range.max - this.range.min + 1;
    const perOctave = this.includeBlackKeys ? 12 : 7;
    return octaves * perOctave;
  }
}
