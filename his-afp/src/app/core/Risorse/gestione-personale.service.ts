import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../models/APIResponse.model';
import { User, UserRole } from '../models/user.model';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GestionePersonaleService {
  readonly #http = inject(HttpClient);
  readonly #users = signal<User[]>([]);
  users = this.#users.asReadonly();

  public fetchUsers() {
    this.#http
      .get<APIResponse<User[]>>(`${environment.apiUrl}/users`)
      .subscribe({
        next: (res: APIResponse<User[]>) => {
          this.#users.set(res.data);
        },
        error: (err) => {
          console.error('Errore durante il fetch del personale:', err);
        },
      });
  }

  public checkUsernameAvailability(username: string): Observable<boolean> {
    return this.#http
      .get<APIResponse<{ available: boolean }>>(`${environment.apiUrl}/users/check/${username}`)
      .pipe(map((res) => res.data.available));
  }

  public createUser(userData: Partial<User> & { password?: string }): Observable<User> {
    return this.#http
      .post<APIResponse<User>>(`${environment.apiUrl}/users`, userData)
      .pipe(
        map((res) => {
          this.fetchUsers(); // Refresh list after creation
          return res.data;
        })
      );
  }

  public editUserRole(userId: number, role: UserRole): Observable<User> {
    return this.#http
      .patch<APIResponse<User>>(`${environment.apiUrl}/users/${userId}/editrole`, { role })
      .pipe(
        map((res) => {
          this.fetchUsers(); // Refresh list after edit
          return res.data;
        })
      );
  }
}
