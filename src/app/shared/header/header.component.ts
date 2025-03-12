import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent] 
})
export class HeaderComponent implements OnInit {
  @Input() isSidebarCollapsed: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  paginaAtual: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.definirPaginaAtual(event.urlAfterRedirects);
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token'); // Remova o token do localStorage
    this.router.navigate(['/login']); // Redirecione para a página de login
  }
  

  definirPaginaAtual(url: string): void {
    const rota = url.split('/')[1]; 
    switch (rota) {
      case 'dashboard':
        this.paginaAtual = 'DASHBOARD';
        break;
      case 'projetos':
        this.paginaAtual = 'Projetos';
        break;
      case 'atividades':
        this.paginaAtual = 'Atividades';
        break;
      case 'usuarios':
        this.paginaAtual = 'Usuários';
        break;
      case 'lancamento-horas':
        this.paginaAtual = 'Horas';
        break;
      default:
        this.paginaAtual = 'Página Inicial';
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
