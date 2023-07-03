import {
  Component,
  Injectable,
  Inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonneeExtrait } from '../model/DonneeExtrait';
import { BankStatementViewerService } from '../service/bank-statement-viewer.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { ReleveBancaire } from '../model/ReleveBancaire';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-modal-facture',
  templateUrl: './modal-facture.component.html',
  styleUrls: ['./modal-facture.component.css'],
})
@Injectable()
export class ModalFactureComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  factures: any[] = [];
  factureASupprimer: string | null = null;
  nouvelleFacture: any = { titre: '', commentaire: '' };
  ajoutEnCours: boolean = false;
  constructor(
    private fireStorage: AngularFireStorage,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    private bankStatementViewerService: BankStatementViewerService,
    public dialogRef: MatDialogRef<ModalFactureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DonneeExtrait,
    private snackBar: MatSnackBar
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  creerFactures(): void {
    this.factures = this.data.factures.map((titre) => {
      return {
        titre: titre,
        commentaire: this.data.commentairesFactures[titre] || '',
        enCoursDeModification: false,
      };
    });
  }

  ngOnInit(): void {
    // this.data_updated = this.data;
    console.log(
      'je suis la modale ***this.data.factures***:',
      this.data.factures
    );
    console.log(
      'je suis la modale ***this.data.commentairesFactures***:',
      this.data.commentairesFactures
    );

    this.creerFactures();
  }

  // ngOnInit(): void {
  //   // affiche les données injectées
  //   console.log(
  //     'je suis la modale ***this.data.factures***:',
  //     this.data.factures
  //   );
  //   console.log(
  //     'je suis la modale ***this.data.commentairesFactures***:',
  //     this.data.commentairesFactures
  //   );
  //   this.factures = [
  //     {
  //       titre: 'Facture 1',
  //       commentaire: 'commentaire1',
  //       enCoursDeModification: false,
  //     },
  //     {
  //       titre: 'Facture 2',
  //       commentaire: 'commentaire2',
  //       enCoursDeModification: false,
  //     },
  //     {
  //       titre: 'Facture 3',
  //       commentaire: 'commentaire3',
  //       enCoursDeModification: false,
  //     },
  //   ];
  // }
  ajouterFacture() {
    console.log('ajouterFactureboutton', this.nouvelleFacture);
    this.ajoutEnCours = true;

    // Ajoutez le titre à la liste des factures
    this.data.factures.push(this.nouvelleFacture.titre);

    // Ajoutez le commentaire à l'objet commentairesFactures avec la clé étant le titre
    this.data.commentairesFactures[this.nouvelleFacture.titre] =
      this.nouvelleFacture.commentaire;

    // Ajoutez la nouvelle facture à la liste des factures dans le composant
    this.factures.push({
      titre: this.nouvelleFacture.titre,
      commentaire: this.nouvelleFacture.commentaire,
      enCoursDeModification: false,
    });

    this.nouvelleFacture = { titre: '', commentaire: '' }; // Réinitialisez l'objet nouvelleFacture

    setTimeout(() => {
      this.ajoutEnCours = false;
    }, 2000); // Délai de 2 secondes.

    // on appel le service pour qu'il fait l'ajout a la base de doneee !
    this.saveFacture(this.data);
    ///TODO this.data heya eli jebneha 3adineha par injection de dependance donc injem nekhdem beha khater feha les donnees lkol ma3adech nekhdem statique !
  }
  sauvegarderCommentaire(facture: any) {
    console.log('modification de commentaire de la facture : ', facture.titre);
    console.log(
      'modification de commentaire de la facture : ',
      facture.commentaire
    );

    facture.enCoursDeModification = true;
    // Simule un délai de traitement ou une requête réseau.
    setTimeout(() => {
      facture.enCoursDeModification = false;
    }, 2000); // Délai de 2 secondes.
    this.UpdateCommentaireFacture(facture);
  }

  UpdateCommentaireFacture(facture: any) {
    console.log('UpdateCommentaireFacture methode : ');
    let updatedData: DonneeExtrait;
    updatedData = this.modifierDataDonneeExtrait(facture);
    this.updateFacture(updatedData);
  }

  modifierDataDonneeExtrait(facture: any): DonneeExtrait {
    // Vérifier si la facture existe dans les factures
    if (this.data.factures.includes(facture.titre)) {
      // Si oui, mettre à jour le commentaire correspondant
      this.data.commentairesFactures[facture.titre] = facture.commentaire;
    } else {
      // Si non, ajouter la facture et le commentaire correspondant
      this.data.factures.push(facture.titre);
      this.data.commentairesFactures[facture.titre] = facture.commentaire;
    }

    // Renvoyer l'objet lui-même pour permettre les chaînages de méthodes si nécessaire
    return this.data;
  }

  updateFacture(data: DonneeExtrait) {
    this.subscriptions.push(
      this.bankStatementViewerService
        .modifierCommentaireFacture(data)
        .subscribe(
          (response: any) => {
            console.log('response de updateFacture:', response);
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

  saveFacture(data: DonneeExtrait) {
    this.subscriptions.push(
      this.bankStatementViewerService.enregistrerFacture(data).subscribe(
        (response: any) => {
          console.log('response de saveFacture:', response);
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
  closeModal(): void {
    this.dialogRef.close();
  }

  saveChanges() {
    this.dialogRef.close(this.factures);
  }
  afficherConfirmationSuppression(facture: any) {
    this.factureASupprimer = facture.titre;
  }
  public findDonneeExtraitById(
    releveBancaire: ReleveBancaire,
    uuid: string
  ): DonneeExtrait | null {
    for (const extrait of releveBancaire.extraits) {
      const found = extrait.donneeExtraits.find(
        (donnee) => donnee.uuid === uuid
      );
      if (found) {
        console.log('------------foundddd!', found);
        return found;
      }
    }
    return null;
  }

  confirmerSuppression() {
    console.log('Suppression de la facture : ', this.factureASupprimer);
    this.subscriptions.push(
      this.bankStatementViewerService
        .supprimerFacture(this.factureASupprimer, this.data)
        .subscribe(
          (response: any) => {
            console.log('response de supprimerFacture******:', response);
            let foundDonneeExtrait = this.findDonneeExtraitById(
              response,
              this.data.uuid
            );
            if (foundDonneeExtrait !== null) {
              console.log('foundDonneeExtrait=', foundDonneeExtrait);
              this.data = foundDonneeExtrait;

              // Mettez à jour le tableau des factures avant de détecter les changements et de recréer les factures
              this.factures = this.factures.filter(
                (facture) => facture.titre !== this.factureASupprimer
              );
              this.factureASupprimer = null;

              // Détecter manuellement les changements après la mise à jour des données
              this.cdRef.detectChanges();
              this.creerFactures();

              // Fermez la boîte de dialogue et renvoyez les données mises à jour
              this.dialogRef.close(this.data);
            } else {
              console.log(
                'DonneeExtrait est non existant dans la BD veuiller verifieé!!!!!!'
              );
            }
          },
          (errorResponse: HttpErrorResponse) => {
            if (errorResponse && errorResponse.error) {
              this.notificationService.notify(
                NotificationType.ERROR,
                errorResponse.error.message
              );
            } else {
              console.log(
                "confirmerSuppression methode !!! Une erreur s'est produite, mais aucune réponse d'erreur n'a été reçue"
              );
            }
          }
        )
    );
  }

  annulerSuppression() {
    this.factureASupprimer = null;
  }
  async onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('file', file);
      const path = `yt/${file.name}`;
      const uploadTask = await this.fireStorage.upload(path, file);
      const url = await uploadTask.ref.getDownloadURL();
      console.log('url', url);
    }
  }
}
