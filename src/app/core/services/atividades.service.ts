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



  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log("🛑 Enviando requisição com token:", token); // 🔹 Verifica se está correto

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  getAtividades(): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map((atividades: any[]) => atividades.map(a => ({
        ...a,
        data_inicio: a.data_inicio ? new Date(a.data_inicio) : null,
        data_fim: a.data_fim ? new Date(a.data_fim) : null
      })))
    );
  }



  getAtividadeById(id: number): Observable<Atividade> {
    return this.http.get<Atividade>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  criarAtividade(atividade: Atividade): Observable<Atividade> {
    const requestBody = {
      id_projeto: (atividade.id_projeto as any)?.id ?? atividade.id_projeto,  
      nome: atividade.nome,
      descricao: atividade.descricao,
      status: atividade.status,
      data_inicio: atividade.data_inicio instanceof Date
        ? atividade.data_inicio.toISOString().split('T')[0]
        : atividade.data_inicio,
      data_fim: atividade.data_fim instanceof Date
        ? atividade.data_fim.toISOString().split('T')[0]
        : atividade.data_fim,
      usuariosIds: atividade.usuariosIds || []  // 🔥 Garante que o array de IDs está presente
    };

    console.log("📤 JSON enviado para criação da atividade:", JSON.stringify(requestBody, null, 2));

    return this.http.post<Atividade>(this.apiUrl, requestBody, { headers: this.getHeaders() })
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
      data_inicio: atividade.data_inicio instanceof Date
        ? atividade.data_inicio.toISOString().split('T')[0]  // Converte para "YYYY-MM-DD"
        : atividade.data_inicio,

      data_fim: atividade.data_fim instanceof Date
        ? atividade.data_fim.toISOString().split('T')[0]
        : atividade.data_fim
    };

    return this.http.put<Atividade>(`${this.apiUrl}/${id}`, atividadeFormatada, { headers: this.getHeaders() });
  }





  deletarAtividade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }


}
