import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {GestioneRisorse} from '../../core/Risorse/gestione-risorse';
import {InputText} from 'primeng/inputtext';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {JsonPipe} from '@angular/common';
import {Button} from 'primeng/button';
import {Message} from 'primeng/message';
import {DatePicker} from 'primeng/datepicker';
import {SelectModule} from 'primeng/select';

@Component({
  selector: 'his-accettazione-pz',
  imports: [InputText, ReactiveFormsModule, JsonPipe, Button, Message, DatePicker, SelectModule],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccettazionePz {
  gestioneRisorse = inject(GestioneRisorse);
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

  readonly #fb = inject(FormBuilder);
  paziente = this.#fb.group({
    anagrafica: this.#fb.group({
      nome: ['', [Validators.required]],
      cognome: ['', [Validators.required]],
      dataNascita: ['', [Validators.required]],
      codiceFiscale: [
        '',
        [Validators.required, Validators.pattern('[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]')],
        // {pattern: {requiredPattern: '^[a-zA-Z ]*$', actualValue: '1'}}
      ],
      sesso: ['', [Validators.required]],
    }),
    sanitaria: this.#fb.group({
      patologia: ['', [Validators.required]],
      codiceColore: ['', [Validators.required]],
      modArrivo: ['', [Validators.required]],
      noteTriage: ['', Validators.required],
    }),
  });

  checkFormControl(control: string) {
    const fc = this.paziente.get(control);
    // nome.invalid && (nome.touched || nome.dirty)
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
      console.log(this.paziente.value);
    } else {
      this.paziente.markAllAsTouched();
    }
  }
}
