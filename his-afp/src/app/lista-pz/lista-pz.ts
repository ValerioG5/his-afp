import { Component, computed, inject, model } from '@angular/core';
import { CardPz } from '../card-pz/card-pz';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SystemStatus } from '../core/SystemStatus/system-status';
import { StatoAPI } from '../ui/stato-api/stato-api';
import { Paziente } from '../core/Pazienti/Pazienti.model';
import { PatientManager } from '../core/Pazienti/patient-manager';

interface Response<T> {
  status: string;
  data: T;
}

@Component({
  selector: 'his-lista-pz',
  imports: [InputTextModule, FormsModule, ButtonModule, CardPz, TagModule, StatoAPI],
  templateUrl: './lista-pz.html',
  styleUrl: './lista-pz.scss',
})
export class ListaPz {
  readonly PatientManager = inject(PatientManager);
  nomePaziente = model<string>('');
  listaPz = this.PatientManager.listaPZ;

  healthStatus = inject(SystemStatus).statoAPI;

  filteredList = computed(() => {
    return this.listaPz().filter((pz: Paziente) =>
      pz.nome.toLowerCase().includes(this.nomePaziente().toLowerCase()),
    );
  });

  editNomePaziente(nomePZ: string) {
    this.nomePaziente.set(nomePZ);
  }
}
