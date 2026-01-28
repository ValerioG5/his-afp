import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkmodeSelector } from "./darkmode-selector/darkmode-selector";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DarkmodeSelector],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('afp-his');
}
