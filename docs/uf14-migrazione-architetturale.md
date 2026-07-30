# UF14 - Migrazione Architetturale

## Panoramica

Migrazione dell'infrastruttura del sistema HIS-AFP da una **rete piatta
monolitica** a un'**architettura Multi-Tier isolata** con supporto a
**Blue/Green deployment**, **zero-downtime**, e **TCP tunneling** per il
database.

## Branch

| Branch | Task | Descrizione |
|--------|------|-------------|
| `uf14-2026/valerio-gravili/task-1` | 🟢 Obbligatoria | Isolamento infrastrutturale e protezione del dato sanitario |
| `uf14-2026/valerio-gravili/task-2` | 🔵 Opzionale | Blue/Green API switching |
| `uf14-2026/valerio-gravili/task-3` | 🔵 Opzionale | Zero-downtime backend e migrazione database |
| `uf14-2026/valerio-gravili/task-4` | 🟡 Opzionale | Tunnel TCP per il database via Gateway |

## Architettura Pre-Migrazione

```
┌──────────────────────────────────────────────────┐
│                   HOST DOCKER                      │
│   Tutti i container sulla stessa rete (bridge)     │
│                                                    │
│   fe-prod ──┐                                      │
│   fe-test  ─┤── backend ──── db ── porta 5432 EXP │
│   fe-sio   ─┘                    porta 3000 EXP    │
│                                                    │
│   Gateway (80, 8080, 8999)                         │
└──────────────────────────────────────────────────┘
```

**Problemi:**
- Rete piatta: nessun isolamento tra frontend e database
- Database esposto sulla porta 5432 verso l'host
- Singolo punto di fallimento del backend
- Downtime durante gli aggiornamenti del backend

## Architettura Post-Migrazione

```
┌──────────────────────────────────────────────────┐
│                   HOST DOCKER                      │
│                                                    │
│  ┌── frontend-net ───┐   ┌── backend-net ───────┐ │
│  │                   │   │                       │ │
│  │ fe-prod           │   │ sio-backend-blue      │ │
│  │ fe-test           │   │ sio-backend-green     │ │
│  │ fe-sio            │   │ db (porta NON esposta)│ │
│  │       │           │   │                       │ │
│  │       ▼           │   │                       │ │
│  │    gateway ◄──────┼───┼► gateway (stream 5432)│ │
│  │                   │   │                       │ │
│  └───────────────────┘   └───────────────────────┘ │
│                                                    │
│  Gateway: unico container con porte esposte        │
│  (80, 8080, 8999, 5432)                            │
└──────────────────────────────────────────────────┘
```

**Miglioramenti:**
- Reti isolate: frontend mai a contatto col database
- Database non raggiungibile dall'esterno (solo via gateway tunnel)
- Backend Blue/Green per aggiornamenti zero-downtime
- Gateway come unico punto di ingresso (security audit compliant)
- Tunnel TCP per accesso DB da parte di tool di data analysis

## Documentazione Task

| Documento | Descrizione |
|-----------|-------------|
| [Task 1: Isolamento Reti](uf14-task-1.md) | Reti Docker isolate, hardening, test di validazione |
| [Task 2: Blue/Green API](uf14-task-2.md) | Due istanze backend, switch traffico, rollback |
| [Task 3: Zero-Downtime](uf14-task-3.md) | Migrazioni additive DB, strategia 4 fasi |
| [Task 4: DB Tunnel](uf14-task-4.md) | NGINX stream module, proxy TCP 5432 |

## Test Rapido di Fumo (Smoke Test)

Dopo aver eseguito `docker compose up -d` su un branch:

```bash
# 1. Verifica frontend PROD
curl http://localhost/              # → HTML (200)

# 2. Verifica API
curl http://localhost/api/health    # → JSON (200)

# 3. Verifica frontend TEST
curl http://localhost:8080/         # → HTML (200)

# 4. Verifica frontend SVI
curl http://localhost:8999/         # → HTML (200)

# 5. Verifica tunnel DB (solo task-4)
psql -h localhost -U sio_user -d sio_db -p 5432
```
