import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BankStatementViewerService {
  private host = environment.apiUrl;
  constructor(private http: HttpClient) {}

  public uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(
      `${this.host}/gestiondesextrais/v1/upload`,
      formData
    );
  }
  public getAllRelevesBancaires(): Observable<any> {
    return this.http.get<any>(
      `${this.host}/gestiondesextrais/v1/AllRelevesBancaires`
    );
  }
}
