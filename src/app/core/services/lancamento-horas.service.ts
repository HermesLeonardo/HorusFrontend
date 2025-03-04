import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LancamentoHoras } from '../model/lancamento-horas.model';

@Injectable({
  providedIn: 'root'
})
export class LancamentoHorasService {
  private apiUrl = 'http://localhost:8080/api/lancamentos-horas';

  constructor(private http: HttpClient) { }

  /** 🔹 Obtém o token e adiciona no cabeçalho */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token enviado no cabeçalho em Lançamento de horas:', token);  // 🔍 Log para depuração
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // 🔹 Garante que o conteúdo seja JSON
    });
  }

  getLancamentos(): Observable<LancamentoHoras[]> {
    return this.http.get<LancamentoHoras[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      tap(lancamentos => console.log("📢 Lançamentos recebidos:", lancamentos)) // Adiciona um log para depuração
    );
  }
  
  

  getLancamentoById(id: number): Observable<LancamentoHoras> {
    return this.http.get<LancamentoHoras>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  criarLancamento(lancamento: LancamentoHoras): Observable<LancamentoHoras> {
    return this.http.post<LancamentoHoras>(this.apiUrl, lancamento, { headers: this.getAuthHeaders() });
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
  
}
