import { AuthenticationService } from './../service/authentication.service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
  
@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private notificationService: NotificationService
  ) {}
    
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.isUserLoggedIn();
  }

  private isUserLoggedIn(): boolean {
    if (this.authenticationService.isUserLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    // TODO - Send notification to user
    this.notificationService.notify(NotificationType.ERROR,`You need to log in to access this page`);
    return false;
  }
}
