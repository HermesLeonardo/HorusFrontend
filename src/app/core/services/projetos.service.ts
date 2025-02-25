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

  salvarProjeto(projeto: { projeto: any; usuariosIds: number[] }): Observable<Projeto> {
    const headers = this.getAuthHeaders();
  
    const requestBody = {
      projeto: {
        nome: projeto.projeto.nome,
        descricao: projeto.projeto.descricao,
        status: typeof projeto.projeto.status === 'object' ? projeto.projeto.status.value : projeto.projeto.status,
        prioridade: typeof projeto.projeto.prioridade === 'object' ? projeto.projeto.prioridade.value : projeto.projeto.prioridade,
        dataInicio: projeto.projeto.dataInicio ? new Date(projeto.projeto.dataInicio).toISOString() : null,
        dataFim: projeto.projeto.dataFim ? new Date(projeto.projeto.dataFim).toISOString() : null
      },
      usuariosIds: projeto.usuariosIds || []
    };
  
    console.log("📢 JSON corrigido antes do envio:", requestBody);
  
    return this.http.post<Projeto>(this.apiUrl, requestBody, { headers });
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
