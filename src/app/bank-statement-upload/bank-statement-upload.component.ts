import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BankStatementViewerService } from '../service/bank-statement-viewer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';
import { NotificationService } from '../service/notification.service';
import { ReleveBancaire } from '../model/ReleveBancaire';

@Component({
  selector: 'app-bank-statement-upload',
  templateUrl: './bank-statement-upload.component.html',
  styleUrls: ['./bank-statement-upload.component.css'],
})
export class BankStatementUploadComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public releveBancaire: ReleveBancaire;
  constructor(
    private bankStatementViewerService: BankStatementViewerService,
    private notificationService: NotificationService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {}
  public onFileInputChange(event: any): void {
    const file: File = event.target.files[0];
    this.subscriptions.push(
      this.bankStatementViewerService.uploadFile(file).subscribe(
        (response: any) => {
          console.log('response de upload', response);
          this.releveBancaire = response; // stocker la réponse dans une variable
        },
        (errorResponse: HttpErrorResponse) => {
          this.notificationService.notify(
            NotificationType.ERROR,
            errorResponse.error.message
          );
        }
      )
    );
  }
}
