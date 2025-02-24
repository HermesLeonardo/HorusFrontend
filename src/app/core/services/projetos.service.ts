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
    console.log('Token de usuarios enviado no cabeçalho:', token);  // Log para verificar o token
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProjetos(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(this.apiUrl, { headers: this.getAuthHeaders() });  
  }

  salvarProjeto(projeto: Projeto): Observable<Projeto> {
    const headers = this.getAuthHeaders();
    
    const projetoFormatado = {
      ...projeto,
      prioridade: typeof projeto.prioridade === 'object' ? projeto.prioridade.value : projeto.prioridade,
      status: typeof projeto.status === 'object' 
        ? projeto.status.value.toUpperCase().replace(/\s+/g, '_') 
        : projeto.status.toUpperCase().replace(/\s+/g, '_'),
      idUsuarioResponsavel: projeto.idUsuarioResponsavel ? projeto.idUsuarioResponsavel.map(id => id) : [], // ✅ Evita erro de null
      dataInicio: projeto.dataInicio ? new Date(projeto.dataInicio).toISOString() : null,
      dataFim: projeto.dataFim ? new Date(projeto.dataFim).toISOString() : null
    };
  
    console.log("📢 JSON corrigido antes do envio:", projetoFormatado);
  
    return this.http.post<Projeto>(this.apiUrl, projetoFormatado, { headers });
  }
  
  
  
  
  

  atualizarProjeto(id: number, projeto: Projeto): Observable<Projeto> {
    return this.http.put<Projeto>(`${this.apiUrl}/${id}`, projeto, { headers: this.getAuthHeaders() });
  }

  deletarProjeto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  listarProjetos(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(this.apiUrl, { headers: this.getAuthHeaders() });  
  }

  criarProjeto(projeto: Projeto): Observable<Projeto> {
    return this.http.post<Projeto>(this.apiUrl, projeto, { headers: this.getAuthHeaders() }); 
  }

  editarProjeto(projeto: Projeto): Observable<Projeto> {
    return this.http.put<Projeto>(`${this.apiUrl}/${projeto.id}`, projeto, { headers: this.getAuthHeaders() });
  }

  excluirProjeto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
