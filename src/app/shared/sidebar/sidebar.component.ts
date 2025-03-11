import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Certifique-se de importar o CommonModule

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule] // Verifique se isso está presente
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = true;
  showModal: boolean = false;

  constructor(private router: Router) {}

  navegar(rota: string): void {
    if (rota === '/relatorios') {
      this.showModal = true; // Exibe o modal apenas para Relatórios
    } else {
      this.router.navigate([rota]);
    }
  }

  fecharModal(): void {
    this.showModal = false; // Fecha o modal
  }
}
