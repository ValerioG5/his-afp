import { Component, computed, inject, model, signal } from '@angular/core';
import { Card, Paziente } from "../card/card";
import { InputTextModule } from 'primeng/inputtext';
import { Bind } from "primeng/bind";
import { FormsModule } from '@angular/forms';
import { Button,ButtonModule  } from "primeng/button";
import { HttpClient } from '@angular/common/http';

interface response{
  status:string;
  data:HealthStatus;
}
interface HealthStatus{
  service:string;
  database:string;
  uptime:number;
}
@Component({
  selector: 'app-lista-pazienti',
  imports: [Card, InputTextModule, Bind, FormsModule, Button,ButtonModule],
  templateUrl: './lista-pazienti.html',
  styleUrl: './lista-pazienti.scss',
})
export class ListaPazienti {
  nomePaziente = model<string>('');
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
  HealthStatus =signal<HealthStatus | null >(null);
  filteredList = computed(() => {
    return this.listaPazienti().filter((pz)=>pz.nome.toLowerCase().includes(this.nomePaziente().toLowerCase()));
  })
  readonly #http = inject(HttpClient);
 editNomePaziente(NomePz: string){
  this.nomePaziente.set(NomePz);
 }
 constructor(){
  this.getHealthStatus();
 }
 getHealthStatus(){
  this.#http.get<response>('http://localhost:3000/health').subscribe((res)=>{console.table(res.data);
    console.table(res.data);
    this.HealthStatus.set(res.data);
  })
  
 }
}
