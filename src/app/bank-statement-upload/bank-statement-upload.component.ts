import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BankStatementViewerService } from '../service/bank-statement-viewer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';
import { NotificationService } from '../service/notification.service';
import { ReleveBancaire } from '../model/ReleveBancaire';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { SocieteService } from '../service/societe.service';

@Component({
  selector: 'app-bank-statement-upload',
  templateUrl: './bank-statement-upload.component.html',
  styleUrls: ['./bank-statement-upload.component.css'],
})
export class BankStatementUploadComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public releveBancaire: ReleveBancaire;
  public originalReleveBancaire: ReleveBancaire;
  public showFullText: boolean[][] = [];
  public fileUploaded: boolean = false;
  public isLoading: boolean = false; // Ajout de la propriété

  constructor(
    private societeService: SocieteService,
    private bankStatementViewerService: BankStatementViewerService,
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    public dialog: MatDialog
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
    console.log('monnnn');
    this.fileUploaded = true;
    const file: File = event.target.files[0];
    console.log('file', file);

    // On active le spinner de chargement
    this.isLoading = true;
    this.subscriptions.push(
      this.bankStatementViewerService.uploadFile(file).subscribe(
        (response: any) => {
          this.releveBancaire = response;
          //this.releveBancaire.dataFileContent = 'chaine vide ';
          // sauvegarder le relevé bancaire original
          this.originalReleveBancaire = JSON.parse(JSON.stringify(response));
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
          // On désactive le spinner de chargement une fois le traitement terminé
          this.isLoading = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.notificationService.notify(
            NotificationType.ERROR,
            errorResponse.error.message
          );
          // On désactive également le spinner de chargement en cas d'erreur
          this.isLoading = false;
        }
      )
    );
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
  public cancelAll(): void {
    console.log('cancelAll was called******');
    this.releveBancaire = JSON.parse(
      JSON.stringify(this.originalReleveBancaire)
    );
    console.log('Toutes les modifications ont été annulées.');
  }

  public onConfirmAll(obj: any): void {
    console.log('onConfirmAll was called');
    console.log(this.releveBancaire);
    console.log('front end pour lajout dune socoete');
    this.bankStatementViewerService
      .ajouterReleverBancaire(this.releveBancaire)
      .subscribe(
        (response: any) => {
          // Vous pouvez afficher une notification de réussite ici
          console.log('nowww!!!! meee response = ', response);
        },
        (errorResponse: HttpErrorResponse) => {
          this.notificationService.notify(
            NotificationType.ERROR,
            errorResponse.error.message
          );
        }
      );
  }
  openConfirmationDialog(action: Function, message: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '20%',
      height: 'auto',
      data: message,
      position: {
        top: '15%',
        left: '35%',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Yes clicked');
        action();
      }
    });
  }
}
