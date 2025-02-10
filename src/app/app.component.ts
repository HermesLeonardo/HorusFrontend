import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';  
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
  isSidebarCollapsed: boolean = false; // Controle do estado do sidebar

  constructor(
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themeService.loadTheme();
    this.themeLoaded = true;

    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showLayoutComponents = !event.urlAfterRedirects.includes('/login');
      this.cdr.detectChanges();  
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.cdr.detectChanges();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;  // Alterna o estado do sidebar
    this.cdr.detectChanges();
  }
}
