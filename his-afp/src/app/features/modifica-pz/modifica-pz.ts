import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'his-modifica-pz',
  imports: [],
  templateUrl: './modifica-pz.html',
  styleUrl: './modifica-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificaPz {
  id = input<string>('');
  readonly #router = inject(Router);

  constructor() {
    effect(() => {
      if (this.id() === undefined || this.id() === '') {
        console.error('ID del paziente non fornito. Navigazione alla lista dei pazienti.');
        this.#router.navigate(['/lista-pz']);
      }
    });
  }
}
