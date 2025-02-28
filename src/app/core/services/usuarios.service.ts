import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Usuario } from '../model/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token enviado no cabeçalho:', token);  // 🔍 Log para depuração
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }


  criarUsuario(usuario: Usuario): Observable<Usuario> {
    console.log("📤 Enviando JSON para API:", usuario); // 🔍 Log para depuração
    return this.http.post<Usuario>(this.apiUrl, usuario, { headers: this.getAuthHeaders() });
  }
  

  atualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario, { headers: this.getAuthHeaders() });
  }

  deletarUsuario(id: number): Observable<void> {
    console.warn(`🚨 Tentativa de deletar usuário com ID: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
        catchError((error) => {
            console.error("❌ Erro ao excluir usuário:", error);
            return throwError(() => new Error(error.error));
        })
    );
}

verificarVinculacoes(id: number): Observable<boolean> {
  return this.http.get<boolean>(`${this.apiUrl}/${id}/tem-vinculacoes`, { headers: this.getAuthHeaders() });
}

  
}
