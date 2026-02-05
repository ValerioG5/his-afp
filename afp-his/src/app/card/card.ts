import { Component,signal, WritableSignal,input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Button } from "primeng/button";

export interface Paziente {

  id: string;
  nome: string;
  cognome: string;
  braccialetto: string;
  eta: number;
  codiceColore: string;
  note: string;
  patologia: string;
}

@Component({
  selector: 'app-card',
  imports: [CardModule, Button],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  paziente = input.required<Paziente>() 

    setColoreDiStato() {
      switch (this.paziente().codiceColore){
        case 'ROSSO':
          return 'border-red-600'
        case 'ARANCIONE':
          return 'border-orange-600'
        case 'AZZURRO':
          return 'border-blue-600'
        case 'VERDE':
          return 'border-green-600'
        case 'BIANCO':
          return 'border-gray-600'
        default:
          return ''
      }
    }
}
