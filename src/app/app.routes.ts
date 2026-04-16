import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/ear-trainer/ear-trainer.component').then(
        (m) => m.EarTrainerComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
