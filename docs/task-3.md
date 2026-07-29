# Report Dimessi (Ultime 24h) - Feature Documentation

## Descrizione

Dashboard di sola consultazione che mostra i pazienti dimessi dal Pronto Soccorso
nelle ultime 24 ore. Consente al coordinatore di reparto di monitorare il turnover
dei posti letto.

## Endpoint API

**GET** `/admissions/reports/discharged`

Protetto da JWT (`authenticateTokenFn`).

### Query SQL

```sql
SELECT a.id,
       a.braccialetto,
       p.nome,
       p.cognome,
       p.data_nascita       AS "dataNascita",
       p.codice_fiscale     AS "codiceFiscale",
       a.data_ora_ingresso  AS "dataOraIngresso",
       a.data_ora_dimissione AS "dataOraDimissione"
FROM admissions a
JOIN patients p ON a.patient_id = p.id
WHERE a.stato = 'DIM'
  AND a.data_ora_dimissione >= NOW() - INTERVAL '24 hours'
ORDER BY a.data_ora_dimissione DESC;
```

## Frontend

### Componenti creati

- `features/report-dimessi/` — pagina del report
- Nuovo modello: `DischargedPatientDTO` in `Pazienti.model.ts`
- Nuovo metodo: `fetchDischargedPatients()` in `PatientManager`

### Tabella

- PrimeNG `p-table` con ordinamento su ogni colonna
- Ordinamento predefinito: `dataOraDimissione` decrescente (più recenti in alto)
- Colori alternati (`stripedRows`)
- Pulsante "Aggiorna" per ricaricare manualmente

### Colonne

| Colonna       | Dato                     |
|---------------|--------------------------|
| Braccialetto  | `pz.braccialetto`        |
| Cognome       | `pz.cognome`             |
| Nome          | `pz.nome`                |
| Ingresso      | `pz.dataOraIngresso`     |
| Dimissione    | `pz.dataOraDimissione`   |

Le date sono formattate come `dd/MM/yyyy HH:mm` tramite `DatePipe`.

## Rotta

`/report-dimessi` (lazy-loaded)

## Navigazione

Pulsante "Report Dimessi" nell'header principale, tra "Accettazione PZ" e "Stato Servizi".
