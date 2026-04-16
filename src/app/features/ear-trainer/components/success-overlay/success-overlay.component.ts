import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';

interface Particle {
  id: number;
  color: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  delay: number;
  shape: 'square' | 'circle' | 'ribbon';
}

@Component({
  selector: 'app-success-overlay',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './success-overlay.component.html',
  styleUrl: './success-overlay.component.scss',
  animations: [
    trigger('overlayAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('cardAnim', [
      transition(':enter', [
        animate(
          '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          keyframes([
            style({ transform: 'scale(0.5) translateY(30px)', opacity: 0, offset: 0 }),
            style({ transform: 'scale(1.04) translateY(-4px)', opacity: 1, offset: 0.7 }),
            style({ transform: 'scale(1) translateY(0)', opacity: 1, offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('iconAnim', [
      transition(':enter', [
        animate(
          '500ms 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          keyframes([
            style({ transform: 'scale(0) rotate(-45deg)', opacity: 0, offset: 0 }),
            style({ transform: 'scale(1.2) rotate(8deg)', opacity: 1, offset: 0.7 }),
            style({ transform: 'scale(1) rotate(0)', opacity: 1, offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class SuccessOverlayComponent implements OnInit {
  @Input() noteName = '';

  particles: Particle[] = [];

  private readonly COLORS = [
    '#6366f1', '#8b5cf6', '#a78bfa',   // indigo/purple
    '#10b981', '#34d399',               // green
    '#f59e0b', '#fbbf24',               // amber
    '#ef4444', '#f87171',               // red
    '#3b82f6', '#60a5fa',               // blue
    '#ec4899', '#f472b6',               // pink
  ];

  ngOnInit(): void {
    this.particles = Array.from({ length: 55 }, (_, i) => ({
      id:    i,
      color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
      x:     40 + Math.random() * 20,          // start near center (%)
      y:     40 + Math.random() * 20,
      angle: Math.random() * 360,
      speed: 60 + Math.random() * 120,         // px
      size:  5 + Math.random() * 9,
      delay: Math.random() * 0.3,
      shape: (['square', 'circle', 'ribbon'] as const)[Math.floor(Math.random() * 3)],
    }));
  }

  particleStyle(p: Particle): Record<string, string> {
    const rad    = (p.angle * Math.PI) / 180;
    const tx     = Math.cos(rad) * p.speed;
    const ty     = Math.sin(rad) * p.speed;

    return {
      left:              `${p.x}%`,
      top:               `${p.y}%`,
      width:             `${p.size}px`,
      height:            p.shape === 'ribbon' ? `${p.size * 3}px` : `${p.size}px`,
      background:        p.color,
      'border-radius':   p.shape === 'circle' ? '50%' : p.shape === 'ribbon' ? '2px' : '2px',
      animation:         `confettiFloat 1s ${p.delay}s ease-out forwards`,
      '--tx':            `${tx}px`,
      '--ty':            `${ty}px`,
    };
  }
}
