import { Component ,inject} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {themeService} from '../../core/theme/theme.service';
@Component({
  selector: 'his-darckmode-selector',
  imports: [ButtonModule],
  templateUrl: './darkmode-selector.component.html',
  styleUrl: './darkmode-selector.component.scss',
})
export class DarkmodeSelector {
  readonly themeService = inject(themeService);
  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
