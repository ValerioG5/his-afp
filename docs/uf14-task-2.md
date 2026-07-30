# UF14 - Task 2: Il "Cambio di Binario" delle API (Blue/Green Deployment)

## Contesto

Il backend (sio-backend) è un singolo punto di fallimento. Ogni aggiornamento
richiede di spegnere il servizio, causando downtime per gli operatori sanitari.

## Soluzione: Blue/Green Deployment

Vengono create **due istanze del backend** che condividono lo stesso database:

```
                        ┌──────────────────┐
                        │                  │
                        │    Database      │
                        │    (postgres)    │
                        │                  │
                        └────────┬─────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
        ┌────────▼──────┐  ┌────▼─────────┐     │
        │               │  │              │     │
        │ sio-backend   │  │ sio-backend  │     │
        │ -blue :3000   │  │ -green :3000 │     │
        │ (ATTIVO)      │  │ (PRONTO)     │     │
        │               │  │              │     │
        └────────┬──────┘  └──────────────┘     │
                 │                              │
                 └──────────┬───────────────────┘
                            │
                     ┌──────▼──────┐
                     │   Gateway   │
                     │   (NGINX)   │
                     │  porta 80   │
                     └─────────────┘
```

## Modifiche Eseguite

### `docker-compose.yml`

Il servizio `backend` originale è stato duplicato in due servizi distinti:

```yaml
sio-backend-blue:
  build: ./backend
  container_name: sio-backend-blue
  environment:
    APP_VERSION: "blue"
  # ...stessa configurazione...

sio-backend-green:
  build: ./backend
  container_name: sio-backend-green
  environment:
    APP_VERSION: "green"
  # ...stessa configurazione...
```

Entrambi puntano allo stesso database (`db`) con le stesse credenziali.
La variabile d'ambiente `APP_VERSION` permette di identificare quale istanza
sta servendo le richieste (utile per debugging).

### `gateway/default.conf`

Introdotto un blocco `upstream` per gestire il backend attivo:

```nginx
upstream backend-api {
    server sio-backend-blue:3000;    # ← BLUE attivo
    # server sio-backend-green:3000; # ← GREEN commentato
}
```

Tutti i server (PROD, TEST, SVI) puntano all'upstream `backend-api`.

## Procedura di Switch (Blue → Green)

1. **Avviare Green** (se non già in esecuzione):
   ```bash
   docker compose up -d sio-backend-green
   ```

2. **Verificare che Green sia sano**:
   ```bash
   curl http://localhost/api/health
   # Oppure test diretto bypassando il gateway:
   docker exec sio-gateway curl http://sio-backend-green:3000/health
   ```

3. **Spostare il traffico**: modificare `gateway/default.conf`:
   ```nginx
   upstream backend-api {
       # server sio-backend-blue:3000;
       server sio-backend-green:3000;    # ← GREEN attivo
   }
   ```

4. **Ricaricare NGINX senza downtime**:
   ```bash
   docker exec sio-gateway nginx -s reload
   ```

5. **Verificare che il traffico arrivi a Green**:
   ```bash
   curl http://localhost/api/health
   ```

## Procedura di Rollback (Green → Blue)

Se la versione Green presenta bug:

1. **Revertare il file** `gateway/default.conf`:
   ```nginx
   upstream backend-api {
       server sio-backend-blue:3000;    # ← BLUE di nuovo attivo
       # server sio-backend-green:3000;
   }
   ```

2. **Ricaricare NGINX**:
   ```bash
   docker exec sio-gateway nginx -s reload
   ```

Il rollback è **istantaneo** (millisecondi). NGINX gestisce le connessioni
in modo trasparente: le richieste in-flight completano verso il vecchio backend
mentre le nuove richieste vanno al nuovo.

## Domanda di Riflessione

> Cosa succede se la versione "Green" scrive un dato nel DB e poi facciamo il rollback?

**Risposta:** Il dato scritto da Green **rimane** nel database. Il rollback
riguarda solo il codice applicativo, non i dati. Se Green ha scritto record
inconsistenti o in un formato non compatibile con Blue, quei dati potrebbero
causare errori quando Blue prova a leggerli.

**Strategie di mitigazione:**
1. **Migrazioni additive**: le modifiche allo schema DB devono essere
   retrocompatibili (aggiungere colonne, mai rimuoverle o rinominarle).
2. **Feature flag**: i nuovi comportamenti sono disabilitati fino allo switch
   completo del traffico.
3. **Test su Green prima dello switch**: validare che le scritture siano
   compatibili anche dopo un eventuale rollback.
4. **Transazioni compensative**: in caso di rollback, eseguire uno script
   che ripulisce i dati scritti da Green (complesso e rischioso).

## Vantaggi del Blue/Green

- **Zero-downtime** durante il deploy: gli operatori non vengono mai disconnessi
- **Rollback immediato**: basta ricaricare NGINX
- **Isolamento del测试**: si può testare Green su dati reali in sola lettura
  prima dello switch (aggiungendo un server separato nell'upstream con peso 0)
- **Nessun impatto sul frontend**: le sessioni JWT restano valide

## Limitazioni

- **Costo**: risorse doppie per il backend (CPU, RAM)
- **Database condiviso**: entrambe le versioni devono essere compatibili con
  lo stesso schema DB
- **Stato applicativo**: eventuali cache in-memory (es. sessione locale)
  vengono perse allo switch (mitigabile con sessioni JWT lato client)
