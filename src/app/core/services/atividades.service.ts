import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Atividade } from '../model/atividade.model';

@Injectable({
  providedIn: 'root'
})
export class AtividadesService {
  private apiUrl = 'http://localhost:8080/api/atividades';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Pega o token salvo no localStorage
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAtividades(): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getAtividadeById(id: number): Observable<Atividade> {
    return this.http.get<Atividade>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  criarAtividade(atividade: Atividade): Observable<Atividade> {
    return this.http.post<Atividade>(this.apiUrl, atividade, { headers: this.getHeaders() });
  }

  atualizarAtividade(id: number, atividade: Atividade): Observable<Atividade> {
    return this.http.put<Atividade>(`${this.apiUrl}/${id}`, atividade, { headers: this.getHeaders() });
  }

  deletarAtividade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
