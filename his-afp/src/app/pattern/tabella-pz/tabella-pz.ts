import { ChangeDetectionStrategy, Component, effect, inject, model } from '@angular/core';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { CardPz } from '../../ui/card-pz/card-pz';

@Component({
  selector: 'his-tabella-pz',
  imports: [FormsModule, InputText, CardPz],
  templateUrl: './tabella-pz.html',
  styleUrl: './tabella-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabellaPz {
  readonly PatientManager = inject(PatientManager);
  nomePaziente = model<string>('');

  constructor() {
    effect(() => {
      this.PatientManager.filterByName(this.nomePaziente());
    });
  }
}
