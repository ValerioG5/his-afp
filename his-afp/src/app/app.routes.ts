import { Routes } from '@angular/router';
import { ListaPz } from './features/lista-pz/lista-pz';
import { AccettazionePz } from './features/accettazione-pz/accettazione-pz';
import { ModificaPz } from './features/modifica-pz/modifica-pz';
import { StatoServizi } from './features/stato-servizi/stato-servizi';

export const routes: Routes = [
  {
    path: 'lista-pz',
    component: ListaPz,
  },
  {
    path: 'accettazione-pz',
    component: AccettazionePz,
  },
  //
  {
    path: 'modifica-pz',
    component: ModificaPz,
  },
  {
    // /modifica-pz?id=2
    path: 'modifica-pz:id',
    component: ModificaPz,
  },
  {
    path: 'stato-servizi',
    component: StatoServizi,
  },
  {
    path: '',
    redirectTo: 'lista-pz',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'lista-pz',
    pathMatch: 'full',
  },
];
