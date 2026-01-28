import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-darkmode-selector',
  imports: [ButtonModule],
  templateUrl: './darkmode-selector.html',
  styleUrl: './darkmode-selector.scss',
})
export class DarkmodeSelector {
  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
}
}
