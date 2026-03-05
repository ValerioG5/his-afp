import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TabellaPz } from '../../pattern/tabella-pz/tabella-pz';

@Component({
  selector: 'his-lista-pz',
  imports: [TabellaPz],
  templateUrl: './lista-pz.html',
  styleUrl: './lista-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaPz {}
