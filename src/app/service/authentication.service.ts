import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public host = environment.apiUrl;
  private token: string | null = null;
  private loggedInUsername: string | null = null;
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {}

  public login(user: User): Observable<HttpResponse<User>> {
    //le parametre {observe:'response'} ==> mean that give all the response request (header...)
    //by default it return only the body and i want the whole response : body,header
    return this.http.post<User>(`${this.host}/user/login`, user, {
      observe: 'response',
    });
    //observe: 'response' with that instruction i say that i want the whole response body and headers ....
  }

  public register(user: User): Observable<User> {
    //le parametre {observe:'response'} ==> mean that give all the response request (header...)
    //by default it return only the body and i want the whole response : body,header
    // in that case i don't neeed the  whole response Only i need the User back
    return this.http.post<User>(`${this.host}/user/register`, user);
  }

  public logOut(): void {
    this.token = null;
    this.loggedInUsername = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('users');
  }

  public saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  public addUserToLocalCache(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUserFromLocalCache(): User | null {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson !== null) {
        return JSON.parse(userJson);
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }
  public loadToken(): void {
    this.token = localStorage.getItem('token');
  }

  public getToken(): string {
    return this.token || '';
  }

  public isUserLoggedIn(): boolean {
    this.loadToken();
    if (this.token != null && this.token !== '') {
      if (this.jwtHelper.decodeToken(this.token).sub != null || '') {
        // sub == username
        if (!this.jwtHelper.isTokenExpired(this.token)) {
          this.loggedInUsername = this.jwtHelper.decodeToken(this.token).sub;
          return true;
        }
      }
    }
    this.logOut();
    return false;
  }
}
