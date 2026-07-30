# UF14 - Task 4: Il Tunnel per il Database

## Contesto

Il team di Data Analysis ha bisogno di connettere i propri strumenti (DBeaver,
TablePlus, psql) al database per generare report. Tuttavia, la porta 5432 del
database deve rimanere chiusa verso l'esterno per policy di sicurezza.

## Soluzione: TCP Tunnel via NGINX Stream Module

Il Gateway (NGINX) viene configurato per fungere da **proxy TCP**: il traffico
verso il Gateway sulla porta 5432 viene inoltrato al container `db:5432`.

```
┌─────────────────────────────────────────────────────────┐
│                        HOST                               │
│                                                           │
│   DBeaver/psql ──► localhost:5432                         │
│                          │                                │
│                          ▼                                │
│   ┌────────────── sio-gateway ──────────────┐             │
│   │                                         │             │
│   │  stream {                                │             │
│   │    server {                              │             │
│   │      listen 5432;   ◄─── esposizione     │             │
│   │      proxy_pass db:5432;                 │             │
│   │    }                                     │             │
│   │  }                                       │             │
│   └───────────────────┬─────────────────────┘             │
│                       │                                   │
│                       ▼                                   │
│   ┌────────── backend-net (Docker) ─────────┐             │
│   │                                         │             │
│   │    ┌── sio-backend:3000 ──┐             │             │
│   │    │   API (HTTP)         │             │             │
│   │    └──────────────────────┘             │             │
│   │    ┌── db:5432 ────────────┐             │             │
│   │    │   PostgreSQL          │             │             │
│   │    │   (nessuna porta      │             │             │
│   │    │    esposta sull'host) │             │             │
│   │    └──────────────────────┘             │             │
│   └─────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

## Modifiche Eseguite

### `gateway/nginx.conf`

Creato un file di configurazione NGINX principale che include:

```nginx
events {
    worker_connections 1024;
}

stream {
    server {
        listen 5432;
        proxy_pass db:5432;
        proxy_timeout 600s;
        proxy_connect_timeout 5s;
    }
}

http {
    include /etc/nginx/conf.d/*.conf;
}
```

- **`stream`**: modulo NGINX per proxy di traffico TCP generico (non HTTP)
- **`listen 5432`**: espone la porta 5432 sul Gateway
- **`proxy_pass db:5432`**: inoltra il traffico al container db sulla rete
  Docker interna
- **`proxy_timeout`**: timeout di connessione post-stabilita (600s = 10 min)
- Il blocco `http` include la configurazione esistente in `conf.d/default.conf`

### `docker-compose.yml`

```yaml
gateway:
  ports:
    - "5432:5432"    # tunnel TCP per il database
  volumes:
    - ./gateway/nginx.conf:/etc/nginx/nginx.conf:ro      # nuovo
    - ./gateway/default.conf:/etc/nginx/conf.d/default.conf:ro

db:
  # ports: "5432:5432"  ← RIMOSSA! Nessuna esposizione diretta
```

## Perché TCP e non HTTP?

Il database PostgreSQL utilizza il **protocollo nativo** (basato su TCP),
non HTTP. Il modulo `stream` di NGINX è progettato per fare proxy di qualsiasi
traffico TCP, mentre i blocchi `server` tradizionali gestiscono solo HTTP/HTTPS.

## Test di Validazione

### Prerequisiti

```bash
docker compose build
docker compose up -d
```

### Test 1: Connessione TCP al database tramite Gateway

```bash
# Con psql (PostgreSQL client)
psql -h localhost -p 5432 -U sio_user -d sio_db

# Inserisci password: sio_password
# Dovresti vedere: sio_db=#
```

### Test 2: Verifica che la porta DB non sia esposta direttamente

```bash
# Tentare di connettersi direttamente al container db fallisce
# perché la porta non è mappata sull'host
telnet localhost 5433  # porta inutilizzata → fallisce
# Oppure verificare che solo il gateway ha la porta 5432 mappata
netstat -an | findstr :5432
# → solo il processo docker-proxy del gateway dovrebbe ascoltare
```

### Test 3: Connessione con DBeaver / TablePlus

1. Host: `localhost`
2. Porta: `5432`
3. Database: `sio_db`
4. Username: `sio_user`
5. Password: `sio_password`

La connessione deve avvenire con successo, attraversando il tunnel NGINX.

### Test 4: Le API continuano a funzionare

```bash
curl http://localhost/api/health
# → Deve restituire JSON con stato UP
```

## Benefici del Tunnel via Gateway

1. **Unico punto di ingresso**: tutta l'amministrazione delle policy di accesso
   è centralizzata nel Gateway
2. **Nessuna esposizione diretta del DB**: anche se un attaccante scansiona
   le porte dell'host, non trova il database esposto
3. **Audit centralizzato**: eventuali log di connessione sono gestiti da NGINX
4. **Disattivazione immediata**: per chiudere l'accesso al DB, basta rimuovere
   o commentare il blocco `stream` e ricaricare NGINX

## Limitazioni

1. **Nessuna autenticazione**: NGINX stream module non supporta autenticazione
   a livello TCP. La sicurezza è affidata a PostgreSQL stesso (pg_hba.conf).
2. **Nessuna cifratura TLS**: la connessione tra client e gateway non è
   cifrata. In produzione, si dovrebbe aggiungere un certificato SSL.
3. **Nessun logging delle query**: il modulo stream registra solo connessioni
   e disconnessioni, non il contenuto delle query SQL.
