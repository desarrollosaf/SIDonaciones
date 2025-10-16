import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, signal, inject, computed } from '@angular/core';
import { enviroment } from '../../enviroments/enviroment'; 


@Injectable({
  providedIn: 'root'
})
export class FeplemService {

  private myAppUrl: string;
  private myAPIUrl: string;
  private http = inject( HttpClient );
  constructor() {
    this.myAppUrl = "https://feplem.gob.mx/";
    this.myAPIUrl ='api/firmaDocumentoDonacion';
  }

  firma(data:any): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myAPIUrl}/`,data)
  }
}
