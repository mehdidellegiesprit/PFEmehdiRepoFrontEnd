import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { User } from '../model/user';
import { environment } from 'src/environments/environment';
import { DonneeExtrait } from '../model/DonneeExtrait';

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
  public enregistrerFacture(data: DonneeExtrait): Observable<any> {
    console.log('je suis le service/ methode : enregistrerFacture!!!', data);
    return this.http.post<any>(
      `${this.host}/gestiondesextrais/v1/facture/add`,
      data
    );
  }
  public modifierCommentaireFacture(data: DonneeExtrait): Observable<any> {
    console.log(
      'je suis le service/ methode : modifierCommentaireFacture!!!',
      data
    );
    return this.http.post<any>(
      `${this.host}/gestiondesextrais/v1/facture/commentaire/update`,
      data
    );
  }
  public supprimerFacture(
    factureASupprimer: string | null,
    data: DonneeExtrait
  ): Observable<any> {
    if (factureASupprimer === null) {
      return throwError('La facture à supprimer est nulle.');
    }
    console.log(
      'je suis le service: supprimerFacture!!!',
      factureASupprimer,
      data
    );
    const url = `${this.host}/gestiondesextrais/v1/facture/delete`;
    const body = {
      facture: factureASupprimer,
      data: data,
    };
    return this.http.post<any>(url, body);
  }
}
