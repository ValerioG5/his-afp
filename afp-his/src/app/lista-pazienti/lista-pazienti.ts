import { Component, signal } from '@angular/core';
import { Card, Paziente } from "../card/card";

@Component({
  selector: 'app-lista-pazienti',
  imports: [Card],
  templateUrl: './lista-pazienti.html',
  styleUrl: './lista-pazienti.scss',
})
export class ListaPazienti {
  listaPazienti = signal<Paziente[]>([{
    id: '123',
    nome: 'Rosso',
    cognome: 'Grodoli',
    braccialetto: '123',
    eta: 0,
    codiceColore: 'Verde',
    note: 'Trauma',
    patologia: 'c19'
  },{
    id: '1',
    nome: 'Rosso',
    cognome: 'Brodoli',
    braccialetto: '123',
    eta: 0,
    codiceColore: 'VERDE',
    note: 'Trauma',
    patologia: 'c19'
  }])
}
