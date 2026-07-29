# Task 1: Gestione Personale

## Descrizione

Pagina dedicata alla gestione dell'anagrafica degli operatori sanitari (Medici,
Infermieri, Amministrativi). Consente di visualizzare lo staff in forza, creare
nuovi operatori e modificare il ruolo di quelli esistenti, con validazione
asincrona in tempo reale per evitare username duplicati.

---

## Endpoint API

Tutti gli endpoint sono protetti da JWT (`authenticateTokenFn`).

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `GET` | `/users` | Elenco completo dello staff |
| `GET` | `/users/check/:username` | Verifica disponibilità username |
| `POST` | `/users` | Creazione nuovo operatore |
| `PATCH` | `/users/:id/editrole` | Modifica ruolo operatore |
| `PATCH` | `/users/:id/deactivate` | Disattivazione operatore |
| `PATCH` | `/users/:id/activate` | Riattivazione operatore |

### GET /users

```json
{
  "status": "success",
  "results": 3,
  "data": [
    { "id": 1, "username": "medico", "role": "DOC", "isActive": true },
    { "id": 2, "username": "infermiere", "role": "INF", "isActive": true }
  ]
}
```

### GET /users/check/:username

```json
{
  "status": "success",
  "data": { "available": true }
}
```

### POST /users

Request:
```json
{
  "username": "mario.rossi",
  "password": "1234",
  "role": "DOC"
}
```
Response (201):
```json
{
  "status": "success",
  "data": { "id": 4, "username": "mario.rossi", "role": "DOC" }
}
```

### PATCH /users/:id/editrole

Request:
```json
{ "role": "INF" }
```
Response:
```json
{
  "status": "success",
  "data": { "id": 4, "username": "mario.rossi", "role": "INF" }
}
```

---

## Frontend

### Rotta

`/gestione-personale` (lazy-loaded)

### Modelli (`core/models/user.model.ts`)

```typescript
export type UserRole = 'DOC' | 'INF' | 'AMM';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  isActive: boolean;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  role: UserRole;
}
```

### Servizio (`core/Risorse/gestione-personale.service.ts`)

Servizio signal-based con i seguenti metodi:

| Metodo | Descrizione |
|--------|-------------|
| `fetchUsers()` | Carica la lista operatori in `users()` signal |
| `checkUsernameAvailability(username)` | Restituisce `Observable<boolean>` |
| `createUser(userData)` | Crea operatore, poi aggiorna la lista |
| `editUserRole(userId, role)` | Aggiorna il ruolo, poi aggiorna la lista |
| `users()` (signal) | Lista operatori (readonly) |
| `isLoading()` (signal) | Stato caricamento |

### Componente (`features/gestione-personale/gestione-personale.ts`)

Layout a due colonne (1/3 form, 2/3 tabella):

**Form (sinistra):**
- Reactive form con `FormBuilder`
- Campi: `username`, `password`, `role`
- Validazione sincrona: `required`, `minLength`
- **Validazione asincrona** su `username`: chiama `/users/check/:username` con **300ms di debounce**
  - Se l'username è già in uso → errore `usernameTaken` → messaggio *"Questo username è già in uso. Scegline un altro."*
  - Se disponibile → messaggio *"Username disponibile."*
- Bottone submit disabilitato quando `form.invalid || form.pending` (copre l'async validator in volo)

**Tabella (destra):**
- PrimeNG `p-table` con paginazione (10 righe)
- Colonne: ID, Username, Ruolo (dropdown inline), Stato
- Il dropdown del ruolo è bindato con `[(ngModel)]` e chiama `onRoleChange()` al cambio
- Feedback tramite `p-message` (success/error) con auto-dismiss a 3-5 secondi

---

## Database

Tabella `sio.users`:

| Colonna | Tipo | Note |
|---------|------|------|
| `id` | `SERIAL PK` | |
| `username` | `VARCHAR(50) UNIQUE NOT NULL` | |
| `password` | `VARCHAR(255) NOT NULL` | Hash bcrypt |
| `role` | `user_role NOT NULL` | Enum `DOC`, `INF`, `AMM` |
| `created_at` | `TIMESTAMP DEFAULT NOW()` | |
| `is_active` | `BOOLEAN DEFAULT TRUE` | |

Seed:
```sql
INSERT INTO users (username, password, role) VALUES
  ('medico',         crypt('1234', gen_salt('bf', 10)), 'DOC'),
  ('infermiere',     crypt('1234', gen_salt('bf', 10)), 'INF'),
  ('amministrativo', crypt('1234', gen_salt('bf', 10)), 'AMM');
```

---

## Navigazione

Pulsante **"Gestione Personale"** nell'header principale (tra "Accettazione PZ" e "Report Dimessi").

---

## Sicurezza

- Tutti gli endpoint staff richiedono JWT
- Password hashate con bcrypt (12 round)
- Controllo username duplicato lato backend (UNIQUE constraint) e lato frontend (async validator)
- Il validatione asincrono evita richieste superflue con debounce di 300ms
