import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { GestionePersonaleService } from '../../core/Risorse/gestione-personale.service';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'his-gestione-personale',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    Select,
  ],
  templateUrl: './gestione-personale.html',
  styleUrl: './gestione-personale.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionePersonale implements OnInit {
  private readonly fb = inject(FormBuilder);
  public readonly personaleService = inject(GestionePersonaleService);

  public roleOptions = [
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

  // Async Validator per controllare l'username
  private usernameAsyncValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }
    // Aggiungo un debounce usando timer per evitare troppe chiamate al backend
    return timer(300).pipe(
      switchMap(() => this.personaleService.checkUsernameAvailability(control.value)),
      map((isAvailable) => (isAvailable ? null : { usernameTaken: true })),
      catchError(() => of(null)) // In caso di errore ignoriamo la validazione
    );
  }

  public onSubmit(): void {
    if (this.userForm.valid) {
      this.personaleService.createUser(this.userForm.value).subscribe({
        next: () => {
          this.userForm.reset({ role: 'DOC' });
        },
        error: (err) => {
          console.error('Errore durante la creazione:', err);
        },
      });
    }
  }

  public onRoleChange(user: User, newRole: UserRole): void {
    if (user.role !== newRole) {
      this.personaleService.editUserRole(user.id, newRole).subscribe();
    }
  }
}
