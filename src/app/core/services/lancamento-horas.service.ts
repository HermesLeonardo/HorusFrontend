import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { LancamentoHoras } from '../model/lancamento-horas.model';
import { Atividade } from '../model/atividade.model';

@Injectable({
  providedIn: 'root'
})
export class LancamentoHorasService {
  private apiUrl = 'http://localhost:8080/api/lancamentos-horas';

  constructor(private http: HttpClient) { }

  /** 🔹 Obtém o token e adiciona no cabeçalho */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // 🔹 Garante que o conteúdo seja JSON
    });
  }

  getLancamentos(): Observable<LancamentoHoras[]> {
    return this.http.get<LancamentoHoras[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      tap(lancamentos => console.log("📢 Lançamentos recebidos:", lancamentos))
    );
  }

  getTotalHorasLancadas(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total-horas-lancadas`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(horas => console.log("Total de horas recebidas:", horas))
    );
  }


  getUltimosLancamentos(limite: number = 5): Observable<LancamentoHoras[]> {
    return this.http.get<LancamentoHoras[]>(`${this.apiUrl}/ultimos-lancamentos?limite=${limite}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(lancamentos => console.log("📢 Últimos lançamentos recebidos:", lancamentos))
    );
  }



  getLancamentoById(id: number): Observable<LancamentoHoras> {
    return this.http.get<LancamentoHoras>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }


  criarLancamento(lancamento: LancamentoHoras): Observable<LancamentoHoras> {
    return this.http.post<LancamentoHoras>(
      'http://localhost:8080/api/lancamentos-horas',
      lancamento,
      { headers: this.getAuthHeaders() }
    );
  }


  atualizarLancamento(id: number, lancamento: LancamentoHoras): Observable<LancamentoHoras> {
    return this.http.put<LancamentoHoras>(`${this.apiUrl}/${id}`, lancamento, { headers: this.getAuthHeaders() });
  }


  deletarLancamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  cancelarLancamento(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancelar`, {}, { headers: this.getAuthHeaders() });
  }

  getAtividades() {
    return this.http.get<{ id: number, nome: string }[]>(`${this.apiUrl}/atividades`, { headers: this.getAuthHeaders() });
  }

  getAtividadesDoUsuario(): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(`http://localhost:8080/api/atividades/usuario-logado`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error("❌ Erro ao buscar atividades do usuário:", error);
        return throwError(() => error);
      })
    );
  }

  getLancamentosDoUsuario(): Observable<LancamentoHoras[]> {
    return this.http.get<LancamentoHoras[]>(`http://localhost:8080/api/lancamentos-horas/usuario-logado`, {
      headers: this.getAuthHeaders()
    });
  }
  
  restaurarLancamento(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/restaurar`, {}, { headers: this.getAuthHeaders() });
  }
  

  getLancamentosCancelados(): Observable<LancamentoHoras[]> {
    return this.http.get<LancamentoHoras[]>(`${this.apiUrl}/cancelados`, {
      headers: this.getAuthHeaders(),
    });
  }



}
