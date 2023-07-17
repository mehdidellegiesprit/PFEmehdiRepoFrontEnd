import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BankStatementViewerService } from '../service/bank-statement-viewer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';
import { NotificationService } from '../service/notification.service';
import { ReleveBancaire } from '../model/ReleveBancaire';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-bank-statement-upload',
  templateUrl: './bank-statement-upload.component.html',
  styleUrls: ['./bank-statement-upload.component.css'],
})
export class BankStatementUploadComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public releveBancaire: ReleveBancaire;
  public showFullText: boolean[][] = [];

  constructor(
    private bankStatementViewerService: BankStatementViewerService,
    private notificationService: NotificationService,
    private datePipe: DatePipe
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {}
  public handleInputChange(event: Event, i: number, j: number): void {
    const target = event.target as HTMLTextAreaElement | null;

    if (target) {
      const donnee = this.releveBancaire.extraits[i].donneeExtraits[j];
      donnee.operations = target.value;
    }
  }

  public onFileInputChange(event: any): void {
    const file: File = event.target.files[0];
    this.subscriptions.push(
      this.bankStatementViewerService.uploadFile(file).subscribe(
        (response: any) => {
          this.releveBancaire = response;
          this.releveBancaire.dataFileContent = 'chaine vide ';

          // Initialisation de showFullText
          this.showFullText = new Array(this.releveBancaire.extraits.length)
            .fill(true)
            .map(() => []);

          this.releveBancaire.extraits = this.releveBancaire.extraits.map(
            (extrait: any, i: number) => {
              extrait.dateExtrait = this.datePipe.transform(
                extrait.dateExtrait,
                'yyyy-MM-dd'
              );
              extrait.dateDuSoldeCrediteurDebutMois = this.datePipe.transform(
                extrait.dateDuSoldeCrediteurDebutMois,
                'yyyy-MM-dd'
              );
              extrait.dateDuSoldeCrediteurFinMois = this.datePipe.transform(
                extrait.dateDuSoldeCrediteurFinMois,
                'yyyy-MM-dd'
              );

              extrait.donneeExtraits = extrait.donneeExtraits.map(
                (donneeExtrait: any, j: number) => {
                  this.showFullText[i][j] = false; // Initialisation de showFullText pour chaque donnée
                  donneeExtrait.dateDonneeExtrait = this.datePipe.transform(
                    donneeExtrait.dateDonneeExtrait,
                    'yyyy-MM-dd'
                  );
                  donneeExtrait.dateValeurDonneeExtrait =
                    this.datePipe.transform(
                      donneeExtrait.dateValeurDonneeExtrait,
                      'yyyy-MM-dd'
                    );
                  return donneeExtrait;
                }
              );
              return extrait;
            }
          );
          console.log('response=', this.releveBancaire);
          console.log('done brooooo');
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

  public onConfirmAll(data: any): void {
    console.log('onConfirmAll');
    console.log(this.releveBancaire);
    // Utilisez votre service pour envoyer `data` au serveur...
    // Remplacez avec la fonction réelle de votre service
    // this.bankStatementViewerService.updateData(data).subscribe(
    //   (response: any) => {
    //     // Vous pouvez afficher une notification de réussite ici
    //   },
    //   (errorResponse: HttpErrorResponse) => {
    //     this.notificationService.notify(
    //       NotificationType.ERROR,
    //       errorResponse.error.message
    //     );
    //   }
    // );
  }
  public editRow(i: number, j: number): void {
    this.releveBancaire.extraits[i].donneeExtraits[j].editing = true;
    console.log('editRow');
  }

  public saveRow(i: number, j: number): void {
    this.releveBancaire.extraits[i].donneeExtraits[j].editing = false;
    // Ici, vous pourriez sauvegarder les modifications dans la base de données ou ailleurs
    console.log('saveRow');
    console.log(this.releveBancaire);
  }
}
