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
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }



  getProjetos(): Observable<Projeto[]> {
    const userRole = localStorage.getItem('userRole');
  
    let url = `${this.apiUrl}/detalhes`; // 
    if (userRole !== 'ROLE_ADMIN') {
      url = `${this.apiUrl}/usuario-logado`; // 
    }
  
    return this.http.get<Projeto[]>(url, { headers: this.getAuthHeaders() });
  }
  

  private formatarData(data: string | Date | null): string | null {
    if (!data) return null; 
    if (typeof data === 'string') return data.split('T')[0]; 
    return data instanceof Date ? data.toISOString().split('T')[0] : null; 
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




    return this.http.post<Projeto>(this.apiUrl, requestBody, { headers });
  }



  atualizarProjeto(id: number, projeto: Projeto, usuariosIds: number[], idUsuarioResponsavel: number | null): Observable<Projeto> {
    const headers = this.getAuthHeaders();

    const requestBody = {
        projeto: {
            nome: projeto.nome,
            descricao: projeto.descricao,
            status: typeof projeto.status === 'object' && 'value' in projeto.status ? projeto.status.value : projeto.status,
            prioridade: typeof projeto.prioridade === 'object' && 'value' in projeto.prioridade ? projeto.prioridade.value : projeto.prioridade,
            dataInicio: projeto.dataInicio ? this.formatarData(projeto.dataInicio) : null,
            dataFim: projeto.dataFim ? this.formatarData(projeto.dataFim) : null
        },
        usuariosIds: usuariosIds || [],
        idUsuarioResponsavel: typeof idUsuarioResponsavel === 'object' && idUsuarioResponsavel !== null
            ? (idUsuarioResponsavel as any).value ?? idUsuarioResponsavel
            : idUsuarioResponsavel ?? null
    };


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
    return this.http.get<Usuario[]>(`${this.apiUrl}/${projetoId}/usuarios`, {
      headers: this.getAuthHeaders()
    });
  }





}
