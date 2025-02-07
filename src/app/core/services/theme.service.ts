import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeClass = 'dark-mode';

  toggleTheme(): void {
    const isDark = document.body.classList.contains(this.darkThemeClass);

    if (isDark) {
      document.body.classList.remove(this.darkThemeClass);
      localStorage.setItem('theme', 'light');
      this.setLightTheme();
    } else {
      document.body.classList.add(this.darkThemeClass);
      localStorage.setItem('theme', 'dark');
      this.setDarkTheme();
    }
  }

  loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add(this.darkThemeClass);
      this.setDarkTheme();
    } else {
      this.setLightTheme();
    }
  }

  private setDarkTheme(): void {
    document.documentElement.style.setProperty('--bg-color', '#0d121d');  // Fundo
    document.documentElement.style.setProperty('--card-bg', '#0f1522');  // Cards
    document.documentElement.style.setProperty('--text-color', '#ffffff');
    document.documentElement.style.setProperty('--input-bg', '#161b26');
    document.documentElement.style.setProperty('--input-border', '#333c4a');
    document.documentElement.style.setProperty('--text-muted', '#a0a4ac');
    document.documentElement.style.setProperty('--button-text', '#ffffff');
    document.documentElement.style.setProperty('--primary', '#4f46e5');

    document.documentElement.style.setProperty('--surface-a', '#0f1522');
    document.documentElement.style.setProperty('--surface-b', '#161b26');
    document.documentElement.style.setProperty('--surface-border', '#333c4a');

    document.documentElement.style.setProperty('--toggle-bg', '#3c3c3c');
    document.documentElement.style.setProperty('--toggle-button', '#ffcc00'); // Amarelo
    document.documentElement.style.setProperty('--dark-toggle-bg', '#6e6f73');
    document.documentElement.style.setProperty('--dark-toggle-button', '#ffffff'); // Branco
  }

  private setLightTheme(): void {
    document.documentElement.style.setProperty('--bg-color', '#f8f9fb');  // Fundo 
    document.documentElement.style.setProperty('--card-bg', '#ffffff');  // Cards
    document.documentElement.style.setProperty('--text-color', '#000000');
    document.documentElement.style.setProperty('--input-bg', '#ffffff');
    document.documentElement.style.setProperty('--input-border', '#d1d5db');
    document.documentElement.style.setProperty('--text-muted', '#606770');
    document.documentElement.style.setProperty('--button-text', '#ffffff');
    document.documentElement.style.setProperty('--primary', '#4f46e5');

    document.documentElement.style.setProperty('--surface-a', '#ffffff');
    document.documentElement.style.setProperty('--surface-b', '#f0f2f5');
    document.documentElement.style.setProperty('--surface-border', '#d1d5db');

    document.documentElement.style.setProperty('--toggle-bg', '#E0E0E0');
    document.documentElement.style.setProperty('--toggle-button', '#ffffff'); // Branco
    document.documentElement.style.setProperty('--dark-toggle-bg', '#f1f1f1');
    document.documentElement.style.setProperty('--dark-toggle-button', '#3c3c3c'); // Cinza escuro
  }

}
