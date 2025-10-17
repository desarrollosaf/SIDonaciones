import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, signal, inject, computed } from '@angular/core';
import { enviroment } from '../../enviroments/enviroment'; 

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  private myAppUrl: string;
  private myAPIUrl: string;
  private http = inject( HttpClient );
  constructor() {
    this.myAppUrl = enviroment.endpoint;
    this.myAPIUrl ='api/donacion';
  }

  saveRegistro(data:any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/savedonacion/`,data)
  }

  getRegistro(rfc:any): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl}/getdonacion/${rfc}`)
  }
 
  validate(data:any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/validate/`, data)
  }

  getAll(): Observable<string> {
    return this.http.get<string>(`${this.myAppUrl}${this.myAPIUrl}/getall`)
  }

   getExcelD(): Observable<Blob> {
      return this.http.get(`${this.myAppUrl}${this.myAPIUrl}/getExcelD`, {
      responseType: 'blob' as 'blob',
    });
    }

}
