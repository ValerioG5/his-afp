import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from './ui/header/header';
import { themeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly themeService = inject(themeService);
  protected readonly title = signal('his-afp');
}
