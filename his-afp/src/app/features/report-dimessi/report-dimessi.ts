import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import { DischargedPatientDTO } from '../../core/Pazienti/Pazienti.model';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';

@Component({
  selector: 'his-report-dimessi',
  imports: [TableModule, DatePipe, Button],
  templateUrl: './report-dimessi.html',
  styleUrl: './report-dimessi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDimessi {
  readonly #patientManager = inject(PatientManager);
  patients = signal<DischargedPatientDTO[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadDischargedPatients();
  }

  loadDischargedPatients() {
    this.loading.set(true);
    this.error.set(null);
    this.#patientManager.fetchDischargedPatients().subscribe({
      next: (res) => {
        this.patients.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Errore durante il caricamento dei pazienti dimessi');
        this.loading.set(false);
      },
    });
  }
}
