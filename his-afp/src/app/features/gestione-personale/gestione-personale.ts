import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Message } from 'primeng/message';
import { GestionePersonaleService } from '../../core/Risorse/gestione-personale.service';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CreateUserPayload, User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'his-gestione-personale',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    Button,
    InputText,
    Select,
    Message,
  ],
  templateUrl: './gestione-personale.html',
  styleUrl: './gestione-personale.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionePersonale implements OnInit {
  private readonly fb = inject(FormBuilder);
  public readonly personaleService = inject(GestionePersonaleService);

  public readonly roleOptions = [
    { label: 'Medico', value: 'DOC' },
    { label: 'Infermiere', value: 'INF' },
    { label: 'Amministrativo', value: 'AMM' },
  ];

  public userForm: FormGroup = this.fb.group({
    username: [
      '',
      [Validators.required, Validators.minLength(3)],
      [this.usernameAsyncValidator.bind(this)],
    ],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['DOC', [Validators.required]],
  });

  ngOnInit(): void {
    this.personaleService.fetchUsers();
  }

  checkFormControl(control: string) {
    const fc = this.userForm.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  checkFormControlError(control: string, err: string) {
    const fc = this.userForm.get(control);

    if (fc && fc.hasError(err)) {
      return fc.getError(err);
    }

    return null;
  }

  isUsernameAvailable() {
    const fc = this.userForm.get('username');
    return fc?.valid && (fc.touched || fc.dirty) && fc.value;
  }

  private usernameAsyncValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value || control.value.length < 3) {
      return of(null);
    }

    return timer(300).pipe(
      switchMap(() => this.personaleService.checkUsernameAvailability(control.value)),
      map((isAvailable) => (isAvailable ? null : { usernameTaken: true })),
      catchError(() => of(null)),
    );
  }

  public onSubmit(): void {
    if (this.userForm.valid) {
      this.personaleService.createUser(this.userForm.value as CreateUserPayload).subscribe({
        next: () => {
          this.userForm.reset({ role: 'DOC' });
        },
        error: (err) => {
          console.error('Errore durante la creazione:', err);
        },
      });
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  public onRoleChange(user: User, newRole: UserRole): void {
    if (user.role !== newRole) {
      this.personaleService.editUserRole(user.id, newRole).subscribe({
        error: (err) => {
          console.error('Errore durante la modifica del ruolo:', err);
        },
      });
    }
  }
}
