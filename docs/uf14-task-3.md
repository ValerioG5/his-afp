# UF14 - Task 3: Zero-Downtime Backend & Database Migration

## Il Dilemma

Il Blue/Green deployment risolve il downtime del backend, ma introduce un
problema: **cosa succede se la nuova versione (Green) richiede una modifica
alla struttura del database?**

```txt
        BLUE (old code)          GREEN (new code)
              │                        │
              │  SELECT name FROM      │  SELECT name, surname FROM
              │  users;                │  users;
              │                        │
              └──────────┬─────────────┘
                         │
                  ┌──────▼──────┐
                  │  Database   │
                  │  (postgres) │
                  └─────────────┘
```

**Problema:** Se Green aggiunge una colonna `surname` che è `NOT NULL`,
la query di Blue (`SELECT name FROM users`), se accompagnata da una INSERT
che non include `surname`, fallirebbe. Inoltre, se la migrazione dello schema
viene applicata mentre Blue è ancora attivo, Blue potrebbe rompersi.

## Soluzione: Migrazioni Additive (Backward-Compatible)

Il principio fondamentale è: **ogni modifica al database deve essere
retrocompatibile con la versione Blue ancora in esecuzione.**

### Regole per migrazioni zero-downtime

| Operazione | Sicura? | Strategia |
|-----------|---------|-----------|
| **Aggiungere colonna** | ✅ Sì | Usare `DEFAULT` o permettere `NULL` |
| **Aggiungere tabella** | ✅ Sì | Le tabelle nuove non impattano il codice vecchio |
| **Aggiungere indice** | ✅ Sì | Attenzione al lock su tabelle grandi (usare `CONCURRENTLY`) |
| **Rinominare colonna** | ❌ No | Il codice vecchio cerca il nome originale |
| **Rimuovere colonna** | ❌ No | Il codice vecchio potrebbe ancora usarla |
| **Modificare tipo** | ⚠️ Dipende | Solo se il nuovo tipo è compatibile col vecchio (es. `VARCHAR` → `TEXT`) |
| **Aggiungere NOT NULL** | ❌ No | Il codice vecchio potrebbe non popolare il campo |
| **Rimuovere tabella** | ❌ No | Il codice vecchio potrebbe referenziarla |

### Strategia in 4 fasi per lo switch

#### Fase 1: Preparazione (Green ancora spento)

Applicare le migrazioni **additive** al database:

```sql
-- ✅ SICURO: nuova colonna con DEFAULT (nullable implicitamente)
ALTER TABLE patients ADD COLUMN surname VARCHAR(100) DEFAULT '';

-- ✅ SICURO: nuova tabella (vecchio codice non la vede)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ⚠️ ATTENZIONE: su tabelle grandi, usare CONCURRENTLY
CREATE INDEX CONCURRENTLY idx_patients_surname ON patients(surname);
```

Il codice Blue continua a funzionare perché:
- Non sa dell'esistenza di `surname` → non la usa → nessun errore
- Le sue INSERT su `patients` non includono `surname` → il DEFAULT la popola
- Non referenzia `audit_logs` → nessun errore

#### Fase 2: Avvio Green e validazione

```bash
docker compose up -d sio-backend-green
```

Green usa le nuove colonne. Blue ignora le nuove colonne.
Entrambi funzionano sullo stesso database.

**Validazione:**
```bash
# Test che Green sia sano
docker exec sio-gateway curl http://sio-backend-green:3000/health

# Test endpoint specifici della nuova versione
docker exec sio-gateway curl http://sio-backend-green:3000/admissions
```

#### Fase 3: Switch del traffico

```nginx
upstream backend-api {
    # server sio-backend-blue:3000;
    server sio-backend-green:3000;    # ← GREEN attivo
}
```

```bash
docker exec sio-gateway nginx -s reload
```

#### Fase 4 (opzionale): Cleanup

Dopo aver verificato che Green funziona correttamente, si può:

```bash
# Spegnere Blue
docker compose stop sio-backend-blue

# Applicare migrazioni distruttive (solo dopo lo switch completo)
-- Ora che Blue non è più attivo, possiamo:
ALTER TABLE patients ALTER COLUMN surname SET NOT NULL;
DROP TABLE old_unused_table;
```

## Test di Validazione

### 1. Verificare che entrambi i backend rispondano

```bash
# Eseguire DENTRO il container gateway
docker exec sio-gateway curl http://sio-backend-blue:3000/health
docker exec sio-gateway curl http://sio-backend-green:3000/health
```

### 2. Verificare lo switch del traffico

```bash
# Prima dello switch
curl http://localhost/api/admissions
# → risposta da BLUE

# Dopo lo switch (nginx -s reload)
curl http://localhost/api/admissions
# → risposta da GREEN
```

### 3. Verificare rollback

```bash
# Modificare default.conf per tornare a BLUE
docker exec sio-gateway nginx -s reload
curl http://localhost/api/admissions
# → di nuovo risposta da BLUE
```

### 4. Verificare nessun downtime durante lo switch

```bash
# In una shell: loop di richieste continue
for i in $(seq 1 100); do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost/api/health
  sleep 1
done

# In un'altra shell: effettuare lo switch
# Tutte le risposte devono essere 200 senza interruzioni
```

## Impatto sul Frontend

- **Nessun impatto**: il frontend Angular è un'applicazione SPA lato client.
  Le richieste API sono asincrone. Lo switch del backend è trasparente.
- **JWT**: i token JWT sono validati dal backend. Fintanto che il segreto
  JWT (`JWT_SECRET`) è lo stesso su Blue e Green, le sessioni restano valide.
- **Nessun reload necessario**: l'applicazione continua a funzionare senza
  ricaricare la pagina.

## Considerazioni su Kubernetes

Se dovessimo migrare verso un orchestratore come Kubernetes:

1. **Deployment Blue/Green**: nativo con `spec.strategy.type: RollingUpdate`
   o tramite Service Mesh (Istio, Linkerd)
2. **Database Migration**: strumenti come `golang-migrate` o `Flyway`
   integrati in un init container
3. **NetworkPolicy**: isolamento simile alle reti Docker ma più granulare
4. **Zero-downtime garantito**: readinessProbe + rolling update bloccano
   il traffico verso i pod non sani

## Limiti dell'Approccio Attuale

1. **Nessun orchestrazione automatica**: lo switch richiede modifica manuale
   del file di configurazione e reload di NGINX
2. **Nessun health-check automatico**: il gateway non verifica che Green sia
   sano prima di instradare il traffico (NGINX upstream check è un modulo
   commerciale)
3. **Migrazioni manuali**: non esiste uno strumento di migration (es.
   `golang-migrate`, `node-pg-migrate`) integrato nel backend
