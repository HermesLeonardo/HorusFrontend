import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth'; // URL do backend

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, senha: password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('userId', response.id); // ✅ Salvar o ID do usuário
      })
    );
  }
  

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): string {
    const role = localStorage.getItem('userRole');
    console.log("🟢 Recuperando userRole do LocalStorage:", role);
    return role ?? 'USUARIO'; // Retorna 'USUARIO' caso esteja null
  }

  getUserName(): string {
    const user = this.getUserData(); // Supondo que `getUserData()` já esteja implementado
    return user?.nome || ''; // Retorna o nome do usuário ou string vazia se não encontrado
  }
  
  

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserId(): number {
    const token = localStorage.getItem('token');
    if (!token) return 0;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o JWT
      return payload?.id || 0; // Retorna o ID do usuário ou 0 se não encontrar
    } catch (error) {
      console.error("❌ Erro ao decodificar token:", error);
      return 0;
    }
    console.log("🔍 ID do usuário recuperado:", token);

  }

  
  getUserEmail(): string {
    const user = this.getUserData();
    return user?.email || ''; // Retorna o e-mail do usuário ou string vazia
  }

  private getUserData(): any {
    const token = localStorage.getItem('token'); // Supondo que o token esteja no localStorage
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload do JWT
      return {
        id: payload.id,
        nome: payload.nome,
        email: payload.sub, // No JWT padrão, o e-mail geralmente está no `sub`
      };
    } catch (error) {
      console.error('❌ Erro ao decodificar token:', error);
      return null;
    }
  }
  
  
  
}
