import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed: boolean = true;
  showModal: boolean = false;
  userRole: string = ''; // Armazena o papel do usuário

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole(); // Recupera a role do usuário
  }

  navegar(rota: string): void {
    if (rota === '/relatorios') {
      this.showModal = true; 
    } else {
      this.router.navigate([rota]);
    }
  }

  fecharModal(): void {
    this.showModal = false; 
  }
}
