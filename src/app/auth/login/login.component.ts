import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, CardModule, InputTextModule, ButtonModule]  // Importando módulos necessários
})

export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    console.log('Enviando login para API:', { email: this.email, password: this.password });

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Resposta da API:', response);

        const token = response.token;
        const role = response.roles[0].authority;

        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);

        console.log('Token salvo no LocalStorage:', token);
        console.log('Role do usuário:', role);

        if (role === 'ROLE_ADMIN') {
          console.log('Redirecionando para Dashboard Admin...');
          this.router.navigate(['/dashboard/admin']);
        } else {
          console.log('Redirecionando para Dashboard Usuário...');
          this.router.navigate(['/dashboard/user']);
        }
      },
      error: (err) => {
        console.error('Erro ao fazer login:', err);
        this.errorMessage = 'Credenciais inválidas!';
      }
    });
  }
}
