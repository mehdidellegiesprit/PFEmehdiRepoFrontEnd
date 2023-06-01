import { HttpErrorResponse } from '@angular/common/http';
import { User } from './../model/user';
import { NotificationService } from './../service/notification.service';
import { AuthenticationService } from './../service/authentication.service';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationType } from '../enum/notification-type.enum';
import { MsalService } from '@azure/msal-angular';
import {
  AccountInfo,
  AuthenticationResult,
  PublicClientApplication,
} from '@azure/msal-browser';
import { MSALInstanceFactory } from '../app.module';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  public showLoading: boolean | undefined;
  private subscription: Subscription[] = [];
  public genderSelected: string = 'Choose Gender';
  constructor(
    private msalService: MsalService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService
  ) {}

  public connection_outlook(): void {
    if (localStorage.getItem('outlook') === null) {
      const ch = localStorage.getItem('outlook');
      console.log('getItem outlook= ', ch);
    }

    if (localStorage.getItem('outlook') === null) {
      this.msalService.instance.handleRedirectPromise().then((res) => {
        if (res != null && res.account != null) {
          this.msalService.instance.setActiveAccount(null);
        }
      });
    }
    if (localStorage.getItem('outlook') !== null) {
      this.msalService.instance.handleRedirectPromise().then((res) => {
        if (res != null && res.account != null) {
          this.msalService.instance.setActiveAccount(res.account);
        }
      });
    }

    console.log('isLoggedIn_outlook() ', this.isLoggedIn_outlook());
  }
  ngOnInit(): void {
    this.connection_outlook();
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    }
  }

  //debut outlook
  // Instantiate the MSAL service
  // Instantiate the MSAL service using the factory function
  //msalInstance = MSALInstanceFactory();
  public login_outlook() {
    localStorage.setItem('outlook', 'outlook');
    // this.msalService.loginRedirect();

    // Instantiate the MSAL service using the factory function
    const msalInstance = MSALInstanceFactory(); //deja declaree l fou9
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      // No accounts are active or connected
      this.msalService.loginRedirect();
    } else {
      // At least one account is active or connected
      this.msalService.logoutRedirect();
      //this.logout_outlook();
      //this.msalService.loginRedirect();
    }
  }
  public logout_outlook() {
    const logoutRequest = {
      postLogoutRedirectUri: 'http://localhost:4200/register',
    };

    this.msalService.logout(logoutRequest);
  }

  public isLoggedIn_outlook(): boolean {
    return this.msalService.instance.getActiveAccount() != null;
  }

  public getName_outlook(): string | undefined {
    return this.msalService.instance.getActiveAccount()?.name;
  }
  public getUsername_outlook(): string | undefined {
    console.log(this.msalService.instance.getActiveAccount());
    return this.msalService.instance.getActiveAccount()?.username;
  }
  public getFamilyFirstName_outlook(): string | undefined {
    const name =
      this.msalService.instance.getActiveAccount()?.idTokenClaims?.name;
    const parts = name?.split(' ');
    const given_name = parts && parts.length > 0 ? parts[0] : '';
    const family_name =
      parts && parts.length > 1 ? parts[parts.length - 1] : '';
    console.log('name = ', name);
    return given_name;
  }
  public getFamilyLastName_outlook(): string | undefined {
    const name =
      this.msalService.instance.getActiveAccount()?.idTokenClaims?.name;
    const parts = name?.split(' ');
    const given_name = parts && parts.length > 0 ? parts[0] : '';
    const family_name =
      parts && parts.length > 1 ? parts[parts.length - 1] : '';
    console.log('name = ', name);
    return family_name;
  }
  //fin outlook

  public onRegister(user: User): void {
    console.log('user=', user);
    this.showLoading = true;
    this.subscription.push(
      this.authenticationService.register(user).subscribe(
        (response: User) => {
          this.showLoading = false;
          this.sendNotification(
            NotificationType.SUCCESS,
            `A new account was created .
            Please check your email for password to log in.`
          );
          console.log('must notfication be declenched');
          localStorage.removeItem('outlook');
          this.router.navigateByUrl('login');
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          const errorMessage =
            error.error.message || 'An unknown error occurred';
          this.sendNotification(NotificationType.ERROR, errorMessage);
          this.showLoading = false;
        },
        () => {}
      )
    );
  }

  private sendNotification(
    notificationType: NotificationType,
    message: string
  ): void {
    console.log('im sendNotification methode');
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(
        notificationType,
        'An error occured. Please try again '
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}
