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
    console.log('Token enviado no cabeçalho em Projetos:', token);  // 🔍 Log para depuração
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }



  getProjetos(): Observable<Projeto[]> {
    return this.http.get<Projeto[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  private formatarData(data: string | Date | null): string | null {
    if (!data) return null; // Retorna null corretamente se a data for nula
    if (typeof data === 'string') return data.split('T')[0]; // Se já for string, formata
    return data instanceof Date ? data.toISOString().split('T')[0] : null; // Se for Date, converte para string
  }



  salvarProjeto(dados: { projeto: Projeto; usuariosIds: number[]; idUsuarioResponsavel?: number | null }): Observable<Projeto> {
    const headers = this.getAuthHeaders();

    const requestBody = {
      projeto: {
        nome: dados.projeto.nome,
        descricao: dados.projeto.descricao,
        status: typeof dados.projeto.status === 'object' && 'value' in dados.projeto.status ? dados.projeto.status.value : dados.projeto.status,
        prioridade: typeof dados.projeto.prioridade === 'object' && 'value' in dados.projeto.prioridade ? dados.projeto.prioridade.value : dados.projeto.prioridade,
        dataInicio: dados.projeto.dataInicio ? this.formatarData(dados.projeto.dataInicio) : null,
        dataFim: dados.projeto.dataFim ? this.formatarData(dados.projeto.dataFim) : null


      },
      usuariosIds: dados.usuariosIds || [],
      idUsuarioResponsavel: typeof dados.idUsuarioResponsavel === 'object' && dados.idUsuarioResponsavel !== null 
      ? (dados.idUsuarioResponsavel as any).value ?? dados.idUsuarioResponsavel
      : dados.idUsuarioResponsavel ?? null
  
    };



    console.log("📢 JSON corrigido antes do envio:", requestBody);

    return this.http.post<Projeto>(this.apiUrl, requestBody, { headers });
  }



  atualizarProjeto(id: number, projeto: Projeto, usuariosIds: number[], idUsuarioResponsavel: number): Observable<Projeto> {
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
      usuariosIds: usuariosIds || [],
      idUsuarioResponsavel: idUsuarioResponsavel || null
    };

    // Adiciona um log para verificar a estrutura enviada ao backend
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
