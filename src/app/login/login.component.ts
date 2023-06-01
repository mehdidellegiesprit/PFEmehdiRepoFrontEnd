import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { User } from './../model/user';
import { NotificationService } from './../service/notification.service';
import { AuthenticationService } from './../service/authentication.service';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationType } from '../enum/notification-type.enum';
import { HeaderType } from '../enum/header-type.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  public showLoading: boolean | undefined;
  private subscription: Subscription[] = [];
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    } else {
      this.router.navigateByUrl('/login');
    }
    //throw new Error('Method not implemented.');
  }

  public onLogin(user: User): void {
    console.log('user=', user);
    this.showLoading = true;
    this.subscription.push(
      this.authenticationService.login(user).subscribe(
        (response: HttpResponse<User>) => {
          const token = response.headers.get(HeaderType.JWT_TOKEN);
          console.log('Token:' + token);
          this.authenticationService.saveToken(token!);
          this.authenticationService.addUserToLocalCache(response.body!);
          this.sendNotification(NotificationType.SUCCESS, `LOGINNNNN `);
          console.log('must notfication be declenched LOGINNNNN');
          this.router.navigateByUrl('/user/management');
          this.showLoading = false;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.showLoading = false;
          const errorMessage =
            error.error.message || 'An unknown error occurred';
          this.sendErrorNotification(NotificationType.ERROR, errorMessage);
        }
      )
    );
  }

  private sendErrorNotification(
    notificationType: NotificationType,
    message: string
  ): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(
        notificationType,
        'An error occured. Please try again '
      );
    }
  }

  // for teting
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
