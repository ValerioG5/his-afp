import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { Message } from 'primeng/message';
import { formatDate } from '@angular/common';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import {
  PatientAnagraficaPrefill,
  PatientRecord,
  PatientSearchOutcome,
} from '../../core/Pazienti/Pazienti.model';

type SearchMode = 'cf' | 'anagrafica';

@Component({
  selector: 'his-ricerca-pz',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    Button,
    InputText,
    DatePicker,
    SelectButton,
    TableModule,
    Message,
  ],
  templateUrl: './ricerca-pz.html',
  styleUrl: './ricerca-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RicercaPaziente {
  readonly #fb = inject(FormBuilder);
  readonly #patientManager = inject(PatientManager);

  readonly maxDate = new Date();

  readonly searchModeOptions: { label: string; value: SearchMode }[] = [
    { label: 'Codice Fiscale', value: 'cf' },
    { label: 'Nome, Cognome e Data di nascita', value: 'anagrafica' },
  ];

  searchMode = signal<SearchMode>('cf');
  isSearching = signal(false);
  searchResults = signal<PatientRecord[]>([]);

  searchResult = output<PatientSearchOutcome>();

  formCF = this.#fb.group({
    codiceFiscale: [
      '',
      [Validators.required, Validators.pattern('[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]')],
    ],
  });

  formAnagrafica = this.#fb.group({
    nome: ['', [Validators.required]],
    cognome: ['', [Validators.required]],
    dataNascita: ['', [Validators.required]],
  });

  onSearchModeChange(mode: SearchMode) {
    this.searchMode.set(mode);
    this.searchResults.set([]);
    this.searchResult.emit({ status: 'idle' });
  }

  checkFormControl(form: 'cf' | 'anagrafica', control: string) {
    const fc = form === 'cf' ? this.formCF.get(control) : this.formAnagrafica.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  onSearch() {
    this.searchResults.set([]);

    if (this.searchMode() === 'cf') {
      if (this.formCF.invalid) {
        this.formCF.markAllAsTouched();
        return;
      }
      this.#eseguiRicerca({
        mode: 'cf',
        codiceFiscale: this.formCF.value.codiceFiscale!,
      });
    } else {
      if (this.formAnagrafica.invalid) {
        this.formAnagrafica.markAllAsTouched();
        return;
      }
      const { nome, cognome, dataNascita } = this.formAnagrafica.value;
      this.#eseguiRicerca({
        mode: 'anagrafica',
        nome: nome!,
        cognome: cognome!,
        dataNascita: formatDate(dataNascita!, 'yyyy-MM-dd', 'en'),
      });
    }
  }

  onSelectPatient(patient: PatientRecord) {
    this.searchResults.set([]);
    this.searchResult.emit({ status: 'found', patient });
  }

  onNuovoPaziente() {
    this.searchResults.set([]);
    this.searchResult.emit({ status: 'not-found', prefill: this.#buildPrefill() });
  }

  #eseguiRicerca(criteria: Parameters<PatientManager['searchPatient']>[0]) {
    this.isSearching.set(true);
    this.#patientManager.searchPatient(criteria).subscribe({
      next: (patients) => {
        this.isSearching.set(false);

        if (patients.length === 0) {
          this.searchResult.emit({ status: 'not-found', prefill: this.#buildPrefill() });
          return;
        }

        if (patients.length === 1) {
          this.searchResult.emit({ status: 'found', patient: patients[0] });
          return;
        }

        this.searchResults.set(patients);
      },
      error: () => {
        this.isSearching.set(false);
        this.searchResult.emit({ status: 'not-found', prefill: this.#buildPrefill() });
      },
    });
  }

  #buildPrefill(): PatientAnagraficaPrefill | undefined {
    if (this.searchMode() === 'cf') {
      const cf = this.formCF.value.codiceFiscale;
      return cf ? { codiceFiscale: cf } : undefined;
    }

    const { nome, cognome, dataNascita } = this.formAnagrafica.value;
    if (!nome && !cognome && !dataNascita) {
      return undefined;
    }

    return {
      nome: nome ?? undefined,
      cognome: cognome ?? undefined,
      dataNascita: dataNascita ? formatDate(dataNascita, 'yyyy-MM-dd', 'en') : undefined,
    };
  }
}
