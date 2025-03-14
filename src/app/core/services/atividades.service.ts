import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Atividade, Usuario } from '../model/atividade.model';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AtividadesService {
  private apiUrl = 'http://localhost:8080/api/atividades';

  constructor(
    private http: HttpClient,
    private authService: AuthService

  ) { }




  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }


  getAtividades(): Observable<Atividade[]> {
    const userRole = this.authService.getUserRole();
    const userId = this.authService.getUserId();

    let url = this.apiUrl;
    if (userRole !== 'ROLE_ADMIN') {
      url = `${this.apiUrl}/usuario-logado`; 
    }

    return this.http.get<Atividade[]>(url, { headers: this.getAuthHeaders() }).pipe(
      map((atividades: any[]) => atividades.map(a => ({
        ...a,
        dataInicio: a.dataInicio ? new Date(a.dataInicio + "T00:00:00") : null,
        dataFim: a.dataFim ? new Date(a.dataFim + "T00:00:00") : null
      })))
    );
  }

  desativarAtividade(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/desativar`, {}, { headers: this.getAuthHeaders() });
}


  


  getAtividadesUsuario(): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(`${this.apiUrl}/usuario-logado`, { headers: this.getAuthHeaders() });
  }

  getUsuariosDaAtividade(idAtividade: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/${idAtividade}/usuarios-responsaveis`, { headers: this.getAuthHeaders() });
  }


  getAtividadeById(id: number): Observable<Atividade> {
    return this.http.get<Atividade>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(atividade => ({
        ...atividade,
        usuariosResponsaveis: atividade.usuariosResponsaveis || []
      }))
    );
  }

  criarAtividade(atividade: Atividade): Observable<Atividade> {

    const headers = this.getAuthHeaders();

    const requestBody = {
      id_projeto: (atividade.id_projeto as any)?.id ?? atividade.id_projeto,
      nome: atividade.nome,
      descricao: atividade.descricao,
      status: atividade.status,
      data_inicio: atividade.dataInicio instanceof Date
        ? atividade.dataInicio.toISOString().split('T')[0]
        : atividade.dataInicio || null,
      data_fim: atividade.dataFim instanceof Date
        ? atividade.dataFim.toISOString().split('T')[0]
        : atividade.dataFim || null,
      usuariosIds: atividade.usuariosIds || []
    };


    console.log("📤 JSON enviado para criação da atividade:", JSON.stringify(requestBody, null, 2));

    return this.http.post<Atividade>(this.apiUrl, requestBody, { headers })
      .pipe(
        tap(response => console.log("✅ Atividade criada com sucesso:", response)),
        catchError(error => {
          console.error("❌ Erro ao criar atividade:", error);
          return throwError(() => error);
        })
      );
  }



  atualizarAtividade(id: number, atividade: Atividade): Observable<Atividade> {
    const atividadeFormatada = {
      ...atividade,
      dataInicio: atividade.dataInicio instanceof Date
        ? atividade.dataInicio.toISOString().split('T')[0]
        : atividade.dataInicio,

      dataFim: atividade.dataFim instanceof Date
        ? atividade.dataFim.toISOString().split('T')[0]
        : atividade.dataFim
    };


    return this.http.put<Atividade>(`${this.apiUrl}/${id}`, atividadeFormatada, { headers: this.getAuthHeaders() });
  }







  deletarAtividade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }


}
