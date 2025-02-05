import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ThemeToggleComponent } from './shared/theme-toggle/theme-toggle.component';
@Component({
  selector: 'app-root',
  standalone: true, 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, ThemeToggleComponent]
})
export class AppComponent {

  themeLoaded: boolean = false;

  constructor(private themeService: ThemeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.themeService.loadTheme();
    this.themeLoaded = true;

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.cdr.detectChanges(); 
  }
}
