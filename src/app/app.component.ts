import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from './shared/theme-toggle/theme-toggle.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { HeaderComponent } from './shared/header/header.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, RouterOutlet, ThemeToggleComponent, SidebarComponent, HeaderComponent]
})
export class AppComponent implements OnInit {

  showLayoutComponents: boolean = true;
  themeLoaded: boolean = false;

  constructor(
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.loadTheme();
    this.themeLoaded = true;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showLayoutComponents = !event.urlAfterRedirects.includes('/login');
      this.cdr.detectChanges();
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.cdr.detectChanges();
  }
}
