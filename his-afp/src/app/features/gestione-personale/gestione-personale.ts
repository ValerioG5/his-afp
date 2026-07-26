import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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

  // Signal per messaggi di feedback
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

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

  checkFormControl(control: string): boolean {
    const fc = this.userForm.get(control);
    return !!(fc?.invalid && (fc.touched || fc.dirty));
  }

  checkFormControlError(control: string, err: string): any {
    const fc = this.userForm.get(control);

    if (fc?.hasError(err)) {
      return fc.getError(err);
    }

    return null;
  }

  isUsernameAvailable(): boolean {
    const fc = this.userForm.get('username');
    return !!(fc?.valid && (fc.touched || fc.dirty) && fc.value);
  }

  private usernameAsyncValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    if (!control.value || control.value.length < 3) {
      return of(null);
    }

    return timer(300).pipe(
      switchMap(() =>
        this.personaleService.checkUsernameAvailability(control.value)
      ),
      map((isAvailable) => (isAvailable ? null : { usernameTaken: true })),
      catchError(() => of(null))
    );
  }

  public onSubmit(): void {
    if (this.userForm.valid) {
      this.successMessage.set(null);
      this.errorMessage.set(null);

      this.personaleService.createUser(this.userForm.value as CreateUserPayload)
        .subscribe({
          next: (user) => {
            this.successMessage.set(
              `Operatore "${user.username}" creato con successo!`
            );
            this.userForm.reset({ role: 'DOC' });
            setTimeout(() => this.successMessage.set(null), 5000);
          },
          error: (err) => {
            const errorMsg = err?.error?.message || 'Errore durante la creazione';
            this.errorMessage.set(errorMsg);
            console.error('Errore durante la creazione:', err);
          },
        });
    } else {
      this.userForm.markAllAsTouched();
      this.errorMessage.set('Compila tutti i campi correttamente');
    }
  }

  public onRoleChange(user: User, newRole: UserRole): void {
    if (user.role !== newRole) {
      this.successMessage.set(null);
      this.errorMessage.set(null);

      this.personaleService.editUserRole(user.id, newRole).subscribe({
        next: (updatedUser) => {
          this.successMessage.set(
            `Ruolo di "${updatedUser.username}" aggiornato a "${this.roleOptions.find(r => r.value === newRole)?.label}"`
          );
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err) => {
          const errorMsg = err?.error?.message || 'Errore durante la modifica del ruolo';
          this.errorMessage.set(errorMsg);
          console.error('Errore durante la modifica del ruolo:', err);
          this.personaleService.fetchUsers();
        },
      });
    }
  }
}
