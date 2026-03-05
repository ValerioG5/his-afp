import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'his-darckmode-selector',
  imports: [ButtonModule],
  templateUrl: './darkmode-selector.component.html',
  styleUrl: './darkmode-selector.component.scss',
})
export class DarkmodeSelector {
  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
  }
}
