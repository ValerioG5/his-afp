# Documentazione Task 2: Modulo di Ricerca e Accettazione Pazienti

In questa task ci siamo occupati di risolvere un problema pratico segnalato dal personale infermieristico: la lentezza nell'accettazione dei pazienti già passati dalla struttura e il rischio costante di creare doppioni in anagrafica.

Per evitare questo, abbiamo modificato il flusso operativo rendendo **obbligatoria la ricerca preventiva** prima di poter aprire o compilare la scheda di accettazione.

---

## 1. Come funziona il nuovo flusso (Workflow)

L'operatore non si trova più davanti al modulo di accettazione vuoto. Il processo ora segue questi passaggi:

1. **Schermata iniziale di Ricerca**: L'infermiere sceglie come cercare il paziente (tramite Codice Fiscale oppure con Nome, Cognome e Data di Nascita).
2. **Esecuzione della ricerca**:
   * **Se il paziente esiste ed è unico**: Il sistema lo seleziona in automatico, apre il form di accettazione e popola subito tutti i suoi dati anagrafici storici. L'operatore deve solo inserire i sintomi e i dati della visita attuale.
   * **Se ci sono più risultati** (es. casi di omonimia): Viene mostrata una tabella con i risultati trovati per permettere all'operatore di scegliere la persona corretta.
   * **Se il paziente non esiste** (o l'operatore clicca su "Nuovo Paziente"): Viene mostrata la scheda per la creazione di un nuovo profilo. Se durante la ricerca l'operatore aveva già digitato un Codice Fiscale o dei dati anagrafici, questi vengono riportati nel nuovo form per non doverli riscrivere.

---

## 2. Scelte di Architettura e Componenti

Come richiesto dalle specifiche, abbiamo separato nettamente la logica di ricerca da quella di inserimento vera e propria.

### Separazione dei Componenti
Abbiamo creato il componente `RicercaPaziente` (`his-ricerca-pz`) lasciandolo completamente slegato dal form di accettazione vero e proprio. Il componente di ricerca si occupa solo di recuperare i dati e comunicare al componente padre cosa è successo.

### Gestione dello Stato e Reattività (Angular Signals)
Nel componente di ricerca abbiamo usato i **Signals** di Angular per gestire lo stato interno:
* `searchMode`: Tiene traccia della modalità di ricerca attiva (`cf` o `anagrafica`).
* `searchResults`: Mantiene l'elenco dei pazienti trovati quando la ricerca restituisce più di un record.
* `isSearching`: Gestisce lo stato di caricamento dei pulsanti per dare un feedback visivo immediato all'utente.

Per inviare i dati all'esterno usiamo il nuovo approccio `output()` di Angular. L'evento emesso (`searchResult`) manda un oggetto contenente uno stato (`found` o `not-found`) e il carico di dati associato (il paziente trovato o l'oggetto `prefill` con i dati già digitati).

### Gestione dei Form (Reactive Forms)
Invece di usare un unico form gigante con campi che si attivano o disattivano a seconda della modalità di ricerca, abbiamo preferito creare due form separati (`formCF` e `formAnagrafica`):
* Questo ci permette di applicare le validazioni in modo pulito (ad esempio la Regex per il Codice Fiscale) senza che i campi dell'altra modalità blocchino l'invio del form.
* Evita codice disordinato per abilitare/disabilitare i controlli a runtime.

---

## 3. Scelte di UI e Usabilità (UX)

* **Date e Formati**: Abbiamo usato il componente `p-datePicker` per la data di nascita, impostando il limite `maxDate` alla data odierna (non ha senso selezionare date future per una nascita). Quando inviamo la data al backend, la formattiamo in ISO (`yyyy-MM-DD`) per evitare i classici problemi di fuso orario o discrepanze di tipo tra `Date` e `string`.
* **Feedback visivo**: Se la ricerca restituisce più risultati, compare un messaggio informativo chiaro prima della tabella che avvisa l'utente di selezionare il paziente corretto tra quelli elencati.
* **Pulsante "Nuovo Paziente"**: È stato inserito sempre visibile per permettere all'infermiere di saltare la ricerca se sa già con certezza di avere davanti un paziente mai registrato prima.

---

## 4. Integrazione con il Form di Accettazione (Come usarlo)

Per integrare il componente `RicercaPaziente` nel componente principale di accettazione, basta ascoltare l'evento `searchResult` nel template:

```html
<!-- Componente di ricerca -->
<his-ricerca-pz (searchResult)="onSearchResult($event)"></his-ricerca-pz>

<!-- Il form vero e proprio compare solo dopo la ricerca -->
@if (mostraFormAccettazione()) {
  <form [formGroup]="formAccettazione">
    <!-- Dati anagrafici e sezione sintomi -->
  </form>
}