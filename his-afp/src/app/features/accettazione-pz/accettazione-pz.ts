import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Fieldset } from 'primeng/fieldset';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import {
  PatientAdmission,
  PatientAnagraficaPrefill,
  PatientRecord,
  PatientSearchOutcome,
} from '../../core/Pazienti/Pazienti.model';
import { RicercaPaziente } from '../ricerca-pz/ricerca-pz';

@Component({
  selector: 'his-accettazione-pz',
  imports: [
    RicercaPaziente,
    InputText,
    ReactiveFormsModule,
    Button,
    Message,
    DatePicker,
    SelectModule,
    Textarea,
    Fieldset,
  ],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccettazionePz {
  gestioneRisorse = inject(GestioneRisorse);
  patientManager = inject(PatientManager);

  readonly maxDate = new Date();
  readonly sexOption = [
    {
      code: 'M',
      desc: 'Maschio',
    },
    {
      code: 'F',
      desc: 'Femmina',
    },
  ];

  searchOutcome = signal<PatientSearchOutcome>({ status: 'idle' });
  showForm = computed(() => this.searchOutcome().status !== 'idle');
  isExistingPatient = computed(() => this.searchOutcome().status === 'found');

  readonly #fb = inject(FormBuilder);
  paziente = this.#fb.group({
    anagrafica: this.#fb.group({
      nome: ['', [Validators.required]],
      cognome: ['', [Validators.required]],
      dataNascita: ['', [Validators.required]],
      codiceFiscale: [
        '',
        [Validators.required, Validators.pattern('[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]')],
      ],
      sesso: ['', [Validators.required]],
    }),
    sanitaria: this.#fb.group({
      patologia: ['', [Validators.required]],
      codiceColore: ['', [Validators.required]],
      modArrivo: ['', [Validators.required]],
      noteTriage: ['', [Validators.required, Validators.maxLength(500)]],
    }),
  });

  onSearchResult(outcome: PatientSearchOutcome) {
    this.searchOutcome.set(outcome);

    if (outcome.status === 'found') {
      this.#populateForm(outcome.patient);
      this.paziente.controls.anagrafica.disable();
      return;
    }

    if (outcome.status === 'not-found') {
      this.paziente.controls.anagrafica.enable();
      this.paziente.reset();
      this.#applyPrefill(outcome.prefill);
      return;
    }

    this.paziente.controls.anagrafica.enable();
    this.paziente.reset();
  }

  checkFormControl(control: string) {
    const fc = this.paziente.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  checkFormControlError(control: string, err: string) {
    const fc = this.paziente.get(control);

    if (fc && fc.hasError(err)) {
      return fc.getError(err);
    } else {
      return null;
    }
  }

  onSubmit() {
    if (this.paziente.valid) {
      const payload = this.paziente.getRawValue() as PatientAdmission;
      this.patientManager.admitPatient(payload);
    } else {
      this.paziente.markAllAsTouched();
    }
  }

  onResetForm() {
    this.searchOutcome.set({ status: 'idle' });
    this.paziente.controls.anagrafica.enable();
    this.paziente.reset();
  }

  #populateForm(patient: PatientRecord) {
    this.paziente.patchValue({
      anagrafica: {
        nome: patient.nome,
        cognome: patient.cognome,
        dataNascita: new Date(patient.dataNascita),
        codiceFiscale: patient.codiceFiscale,
        sesso: patient.sesso,
      },
    });
  }

  #applyPrefill(prefill?: PatientAnagraficaPrefill) {
    if (!prefill) {
      return;
    }

    this.paziente.patchValue({
      anagrafica: {
        nome: prefill.nome ?? '',
        cognome: prefill.cognome ?? '',
        dataNascita: prefill.dataNascita ? new Date(prefill.dataNascita) : '',
        codiceFiscale: prefill.codiceFiscale ?? '',
      },
    });
  }
}
