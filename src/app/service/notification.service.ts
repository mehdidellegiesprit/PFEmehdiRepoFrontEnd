import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { NotificationType } from '../enum/notification-type.enum';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private notifier: NotifierService) {}

  public notify(type: NotificationType, message: string) {
    //this.notifier.hideAll() ;
    console.log('notification de type :', type, ' avec le message : ', message);
    this.notifier.notify(type, message);
  }
}
