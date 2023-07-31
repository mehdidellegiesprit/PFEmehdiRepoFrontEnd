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
import Swal, { SweetAlertIcon } from 'sweetalert2';

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
  public showError: boolean[][] = [];

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
  public toDate(dateStr: string): Date {
    return new Date(dateStr);
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
          // Sauvegarder le relevé bancaire original avant transformation
          this.originalReleveBancaire = JSON.parse(JSON.stringify(response));

          this.releveBancaire = response;
          //this.releveBancaire.dataFileContent = 'chaine vide ';

          // Initialisation de showFullText
          this.showFullText = new Array(this.releveBancaire.extraits.length)
            .fill(true)
            .map(() => []);

          // Initialisation de showError
          this.showError = new Array(this.releveBancaire.extraits.length)
            .fill(false)
            .map(() =>
              new Array(
                this.releveBancaire.extraits[0].donneeExtraits.length
              ).fill(false)
            );

          // Maintenant on peut transformer les dates
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
    const donnee = this.releveBancaire.extraits[i].donneeExtraits[j];

    const debit = Number(donnee.debit);
    const credit = Number(donnee.credit);

    if (debit === 0 && credit === 0) {
      // Afficher une erreur et retourner pour arrêter le processus de sauvegarde
      this.showError[i][j] = true;
      return;
    }

    this.showError[i][j] = false; // reset the error flag if the inputs are valid
    donnee.editing = false;
    // Continuez avec le processus de sauvegarde
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

  async showInformation(message: string) {
    console.log('showInformation', message);

    let title = 'Information';
    let text = message;
    let icon: SweetAlertIcon = 'info';

    if (
      message ===
      "Voulez-vous vraiment confirmer l enregistrement du Relevé bancaire ?"
    ) {
      title = "Confirmer l'enregistrement";
      text = 'En confirmant, Le Releve Bancaire sera sauvegardées dans la BD !';
      icon = 'warning';
    } else if (
      message === 'Voulez-vous vraiment annuler toutes les modifications ?'
    ) {
      title = 'Annulation de modifications';
      text = "Vous êtes sur le point d'annuler toutes les modifications!.";
      icon = 'error';
    }

    await Swal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
    });
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
        this.showInformation(message)
          .then(() => {
            console.log('SweetAlert confirmé');
            action();
          })
          .catch(() => {
            console.log("Erreur lors de l'exécution de SweetAlert");
          });
      }
    });
  }
}
