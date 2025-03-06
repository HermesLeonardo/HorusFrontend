import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Atividade } from '../model/atividade.model';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AtividadesService {
  private apiUrl = 'http://localhost:8080/api/atividades';

  constructor(private http: HttpClient) { }



  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token enviado no cabeçalho em Atividades:', token);  // 🔍 Log para depuração
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }


  getAtividades(): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map((atividades: any[]) => atividades.map(a => ({
        ...a,
        dataInicio: a.dataInicio ? new Date(a.dataInicio + "T00:00:00") : null,
        dataFim: a.dataFim ? new Date(a.dataFim + "T00:00:00") : null
      })))
    );
  }




  getAtividadeById(id: number): Observable<Atividade> {
    return this.http.get<Atividade>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
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

    return this.http.post<Atividade>(this.apiUrl, requestBody, { headers})
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
