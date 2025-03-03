import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Projeto } from '../model/projeto.model';
import { Usuario } from '../model/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetosService {
  private apiUrl = 'http://localhost:8080/api/projetos';
  httpHeaders: HttpHeaders | { [header: string]: string | string[]; } | undefined;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token enviado no cabeçalho:', token);  // 🔍 Log para depuração
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }



  getProjetos(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  salvarProjeto(dados: { projeto: Projeto; usuariosIds: number[] }): Observable<Projeto> {
    const headers = this.getAuthHeaders();

    const requestBody = {
      projeto: {
        nome: dados.projeto.nome,
        descricao: dados.projeto.descricao,
        status: typeof dados.projeto.status === 'object' && 'value' in dados.projeto.status ? dados.projeto.status.value : dados.projeto.status,
        prioridade: typeof dados.projeto.prioridade === 'object' && 'value' in dados.projeto.prioridade ? dados.projeto.prioridade.value : dados.projeto.prioridade,
        dataInicio: dados.projeto.dataInicio ? new Date(dados.projeto.dataInicio).toISOString() : null,
        dataFim: dados.projeto.dataFim ? new Date(dados.projeto.dataFim).toISOString() : null
      },
      usuariosIds: dados.usuariosIds || []
    };



    console.log("📢 JSON corrigido antes do envio:", requestBody);

    return this.http.post<Projeto>(this.apiUrl, requestBody, { headers });
  }




  atualizarProjeto(id: number, projeto: Projeto, usuariosIds: number[]): Observable<Projeto> {
    const headers = this.getAuthHeaders();

    if (!projeto) {
      console.error("❌ ERRO: O objeto 'projeto' está NULL antes da requisição!");
      return throwError(() => new Error("Objeto 'projeto' inválido!"));
    }

    const requestBody = {
      projeto: {
        ...projeto,
        dataInicio: projeto.dataInicio ? projeto.dataInicio : null,
        dataFim: projeto.dataFim ? projeto.dataFim : null
      },
      usuariosIds: usuariosIds || []
    };

    console.log("📢 JSON enviado na atualização:", JSON.stringify(requestBody, null, 2));

    return this.http.put<Projeto>(`${this.apiUrl}/${id}`, requestBody, { headers });
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

  getUsuariosPorProjeto(projetoId: number) {
    console.log("🔍 Buscando usuários para o projeto ID:", projetoId);
    return this.http.get<Usuario[]>(`${this.apiUrl}/${projetoId}/usuarios`, {
      headers: this.getAuthHeaders()
    });
  }
  
  
  


}
