import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Societe } from '../model/Societe';

@Injectable({
  providedIn: 'root',
})
export class SocieteService {
  private host = environment.apiUrl;
  constructor(private http: HttpClient) {}

  public getAllSocietes(): Observable<any> {
    return this.http.get<any>(`${this.host}/gestiondesextrais/v1/societe/all`);
  }
}
