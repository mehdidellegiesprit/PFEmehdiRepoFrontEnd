import { AuthenticationService } from './../service/authentication.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(
    httpRequest: HttpRequest<any>,
    httpHandler: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      httpRequest.url.includes(`${this.authenticationService.host}/user/login`)
    ) {
      return httpHandler.handle(httpRequest);
    }
    if (
      httpRequest.url.includes(
        `${this.authenticationService.host}/user/register`
      )
    ) {
      return httpHandler.handle(httpRequest);
    }
    this.authenticationService.loadToken();
    const token = this.authenticationService.getToken();
    //the HttpRequest is MUTTABLE on ne peut pas la mofidier ! we must clone the request and pass it then to the handler
    const request = httpRequest.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    // If the URL does match to protected route ==> not login or register or reset so
    //, pass the new request to the next handler
    return httpHandler.handle(request);
  }
}
