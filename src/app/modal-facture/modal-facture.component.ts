import { Component, Injectable, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DonneeExtrait } from '../model/DonneeExtrait';

@Component({
  selector: 'app-modal-facture',
  templateUrl: './modal-facture.component.html',
  styleUrls: ['./modal-facture.component.css'],
})
@Injectable()
export class ModalFactureComponent implements OnInit {
  factures: any[] = []; // Ici, remplissez cette liste avec vos données de facture.
  displayedColumns: string[] = ['titre', 'commentaire', 'actions'];
  confirmationSuppressionFacture = false; // Nouvelle variable pour la confirmation de suppression
  factureASupprimer: any; // Nouvelle variable pour stocker la facture à supprimer
  commentairesModifies: { [key: string]: boolean } = {};

  constructor(
    public dialogRef: MatDialogRef<ModalFactureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DonneeExtrait
  ) {}

  ngOnInit(): void {
    this.factures = [
      { titre: 'Facture 1', commentaire: 'commentaire1' },
      { titre: 'Facture 2', commentaire: 'commentaire2' },
      { titre: 'Facture 3', commentaire: 'commentaire3' },
    ];
  }

  sauvegarderCommentaire(facture: any) {
    console.log('modification de commentaire de la facture : ', facture);

    // this.factureService.updateFacture(facture).subscribe(() => {
    //   // la ligne delete est pour supprimer localement l'objet car il n y a besoin de faire le trace !
    //   delete this.commentairesModifies[facture.titre];
    // });
  }

  // Affiche la boîte de dialogue de confirmation de suppression
  afficherConfirmationSuppression(facture: any) {
    this.factureASupprimer = facture;
    this.confirmationSuppressionFacture = true;
  }

  // Confirme la suppression de la facture
  confirmerSuppression() {
    console.log('Suppression de la facture : ', this.factureASupprimer);
    // Logique de suppression réelle ici

    // Réinitialisation des variables après la suppression
    this.confirmationSuppressionFacture = false;
    this.factureASupprimer = null;
  }

  // Annule la suppression de la facture
  annulerSuppression() {
    this.confirmationSuppressionFacture = false;
    this.factureASupprimer = null;
  }

  // Ajoute un commentaire à une facture existante.
  ajouterCommentaire(facture: any) {
    console.log("Ajout d'un commentaire à la facture: ", facture);
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
