import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service'; // ✅ Importe o AuthService

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
  nomeUsuario: string = ''; // ✅ Variável para armazenar o nome do usuário

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.definirPaginaAtual(event.urlAfterRedirects);
      }
    });

    this.carregarNomeUsuario(); // ✅ Chamar a função ao iniciar o componente
  }

  private carregarNomeUsuario(): void {
    setTimeout(() => {
      this.nomeUsuario = this.authService.getUserName();
    }, 500); // Aguarda 500ms para garantir que o LocalStorage esteja atualizado
  }


  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
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
