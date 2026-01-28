import { Component,signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Button } from "primeng/button";

interface Paziente {
  
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
  nome:string = 'pietro';
  paziente = signal<Paziente>({
    id: '123',
    nome: 'Rosso',
    cognome: '',
    braccialetto: '',
    eta: 0,
    codiceColore: '',
    note: 'Trauma',
    patologia: 'c19'
  })
  cambiaNome(){
    

  }
    
}
