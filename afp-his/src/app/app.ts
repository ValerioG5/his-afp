import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkmodeSelector } from "./darkmode-selector/darkmode-selector";
import { Card } from "./card/card";
import { ListaPazienti } from "./lista-pazienti/lista-pazienti";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DarkmodeSelector, Card, ListaPazienti],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('afp-his');
}
