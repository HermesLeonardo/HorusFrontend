import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl = 'http://localhost:8080/api/relatorios';

  constructor(private http: HttpClient) {}

  obterRelatorios(filtros: any): Observable<any[]> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params = params.set(key, filtros[key]);
      }
    });

    return this.http.get<any[]>(this.apiUrl, { params });
  }
}
