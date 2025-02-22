import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projeto } from '../model/projeto.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetosService {
  private apiUrl = 'http://localhost:8080/api/projetos';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token de usuarios enviado no cabeçalho:', token);  // 🔍 Log para verificar o token
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProjetos(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(this.apiUrl, { headers: this.getAuthHeaders() });  
  }

  salvarProjeto(projeto: Projeto): Observable<Projeto> {
    return this.http.post<Projeto>(this.apiUrl, projeto, { headers: this.getAuthHeaders() });  
  }

  atualizarProjeto(id: number, projeto: Projeto): Observable<Projeto> {
    return this.http.put<Projeto>(`${this.apiUrl}/${id}`, projeto, { headers: this.getAuthHeaders() });
  }

  deletarProjeto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  listarProjetos(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(this.apiUrl, { headers: this.getAuthHeaders() });  // 🔥 Token adicionado
  }

  criarProjeto(projeto: Projeto): Observable<Projeto> {
    return this.http.post<Projeto>(this.apiUrl, projeto, { headers: this.getAuthHeaders() });  // 🔥 Token adicionado
  }

  editarProjeto(projeto: Projeto): Observable<Projeto> {
    return this.http.put<Projeto>(`${this.apiUrl}/${projeto.id}`, projeto, { headers: this.getAuthHeaders() });  // 🔥 Token adicionado
  }

  excluirProjeto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
