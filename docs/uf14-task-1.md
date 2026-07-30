# UF14 - Task 1: Isolamento Infrastrutturale e Protezione del Dato Sanitario

## Architettura Pre-Migrazione (Problema)

L'infrastruttura originale utilizzava una **rete piatta** (Docker default bridge).
Tutti i container (frontend, backend, database) comunicavano sulla stessa rete
senza alcun isolamento. Inoltre il database esponeva la porta `5432` verso
l'host, rendendolo potenzialmente raggiungibile dall'esterno.

```
┌─────────────────────────────────────────────────────┐
│                    HOST DOCKER                       │
│                                                      │
│   fe-prod ──┐                                        │
│   fe-test  ─┤─── backend ──── db (porta 5432 esposta)│
│   fe-sio   ─┘                    ↑                    │
│                                  │  accessibile da    │
│                                  │  fuori Docker      │
│   gateway (80, 8080, 8999)       │                    │
└─────────────────────────────────────────────────────┘
```

**Problemi di sicurezza:**
- Un attaccante che compromette un frontend può tentare un attacco diretto al DB
- Il database è potenzialmente raggiungibile dall'host e dalla rete esterna
- Nessuna segregazione di rete tra i tier applicativi
- L'audit di sicurezza per l'accreditamento sanitario regionale richiederebbe
  una Netlist certificate e reti isolate

## Architettura Post-Migrazione (Soluzione)

Due reti Docker isolate:

- **`frontend-net`**: contiene solo i frontend (fe-prod, fe-test, fe-sio)
- **`backend-net`**: contiene backend e database (rete `internal: true`)

Il **Gateway (NGINX)** è l'unico container su entrambe le reti e funge da
**unico punto di ingresso** per tutto il traffico.

```
┌─────────────────────────────────────────────────────┐
│                   HOST DOCKER                        │
│                                                      │
│  ┌── frontend-net ──┐    ┌── backend-net (internal)─┐│
│  │                  │    │                          ││
│  │  fe-prod         │    │  backend                 ││
│  │  fe-test         │    │     │                    ││
│  │  fe-sio          │    │     ▼                    ││
│  │        │         │    │    db (porta NON esposta)││
│  │        ▼         │    │                          ││
│  │     gateway ◀────┼────┼──── gateway              ││
│  │                  │    │                          ││
│  └──────────────────┘    └──────────────────────────┘│
│                                                      │
│  gateway porte esposte: 80, 8080, 8999               │
│  db/backend: NESSUNA porta verso l'host              │
└─────────────────────────────────────────────────────┘
```

## Modifiche Eseguite

### `docker-compose.yml`

```yaml
networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
    internal: true
```

- **`internal: true`** su `backend-net`: impedisce qualsiasi traffico in uscita
  verso l'esterno. I container su questa rete possono comunicare solo tra loro.
- **Rimossa** l'esposizione `ports: "5432:5432"` dal servizio `db`
- **Rimossa** l'esposizione `ports: "3000:3000"` dal servizio `backend`
- Il Gateway (`sio-gateway`) è l'**unico container** con `ports` mappate
- Assegnazione reti: ogni frontend → solo `frontend-net`; backend e db → solo `backend-net`

## Test di Validazione

### Prerequisiti

```bash
docker compose build
docker compose up -d
```

### Test 1: Il database NON è raggiungibile dal frontend

```bash
docker exec sio-fe-prod ping sio-postgres
```
**Risultato atteso:**
```
ping: bad address 'sio-postgres'
```
Il nome DNS `sio-postgres` non viene risolto perché il container fe-prod è
sulla `frontend-net` mentre il database è sulla `backend-net`. Non esiste un
ponte di routing DNS tra le due reti.

### Test 2: Il database NON è raggiungibile dall'host sulla porta 5432

```bash
telnet localhost 5432
# oppure
Test-NetConnection -ComputerName localhost -Port 5432
```
**Risultato atteso:** Connessione rifiutata o timeout.

### Test 3: Il backend è raggiungibile dal gateway (proxy funzionante)

```bash
curl http://localhost/api/health
```
**Risultato atteso:** Risposta JSON dal backend (es. `{"status":"success","data":{...}}`)

### Test 4: Il frontend PROD è servito correttamente

```bash
curl http://localhost/
```
**Risultato atteso:** HTML della applicazione Angular.

### Test 5: Il frontend non può contattare direttamente il backend

```bash
docker exec sio-fe-prod curl http://sio-backend:3000/health
```
**Risultato atteso:**
```
curl: (6) Could not resolve host: sio-backend
```
oppure timeout, a seconda della configurazione DNS di Docker.

## Perché questa migrazione

L'architettura Multi-Tier a compartimenti stagni è necessaria per:

1. **Protezione dati sensibili**: i dati sanitari dei pazienti non devono essere
   accessibili da container potenzialmente compromessi (es. un frontend
   esposto a XSS/CSRF).

2. **Principio del minimo privilegio**: ogni container ha accesso solo alle
   risorse strettamente necessarie. Un frontend non ha *alcuna* necessità
   di raggiungere il database.

3. **Accreditamento sanitario**: normative come il GDPR e le linee guida
   AgID per la sanità digitale richiedono misure di segregazione di rete.

4. **Difesa in profondità**: anche se un attaccante bypassa il gateway e
   compromette un frontend, non può escalare i privilegi verso il database
   perché la rete è isolata a livello L3/L4.

## Limitazioni e Miglioramenti Prospettati

**Limitazione attuale:** La rete `backend-net` è marcata `internal: true`.
Questo impedisce al backend di effettuare chiamate verso l'esterno (es.
webhook, API esterne). Se in futuro il backend dovesse integrarsi con servizi
esterni, `internal: true` andrebbe rimosso.

**Miglioramento futuro:** Utilizzare un orchestratore come Kubernetes con
NetworkPolicy per un controllo più granulare del traffico tra pod.

**Alternativa:** Invece di due reti Docker bridge, si potrebbe utilizzare una
singola rete con iptables/ferm per limitare il traffico. Tuttavia, l'approccio
con due reti è più dichiarativo, portabile e non richiede script di firewall.
