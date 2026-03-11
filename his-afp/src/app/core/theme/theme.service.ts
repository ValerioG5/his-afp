import { signal,Injectable } from '@angular/core';
@Injectable({

    providedIn: 'root'
})

export class themeService {
    isDarkMode = signal<boolean>(false);
    private readonly ThemeKey = 'app-theme-dark';
    toggleDarkMode() { 
        const isDark = !this.isDarkMode();
        this.isDarkMode.set(isDark);
        localStorage.setItem(this.ThemeKey, String(isDark));
      
    const element = document.querySelector('html');
    if (isDark) {
      element?.classList.add('my-app-dark');
    } else {
      element?.classList.remove('my-app-dark');
    }
    }
    constructor(){
        this.initialTheme();

    }
    private initialTheme() {
        const savedTheme = localStorage.getItem(this.ThemeKey);
        if (savedTheme === 'true'){
            this.isDarkMode.set(true);
            document.querySelector('html')?.classList.add('my-app-dark');
        }
    }
}

