import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'his-modifica-pz',
  imports: [],
  templateUrl: './modifica-pz.html',
  styleUrl: './modifica-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificaPz {
  patientId = input<string>();
}
