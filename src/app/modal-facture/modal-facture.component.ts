import { Component, Injectable, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonneeExtrait } from '../model/DonneeExtrait';

@Component({
  selector: 'app-modal-facture',
  templateUrl: './modal-facture.component.html',
  styleUrls: ['./modal-facture.component.css'],
})
@Injectable()
export class ModalFactureComponent implements OnInit {
  factures: any[] = [];
  factureASupprimer: string | null = null;
  nouvelleFacture: any = { titre: '', commentaire: '' };
  ajoutEnCours: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<ModalFactureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DonneeExtrait,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.factures = [
      {
        titre: 'Facture 1',
        commentaire: 'commentaire1',
        enCoursDeModification: false,
      },
      {
        titre: 'Facture 2',
        commentaire: 'commentaire2',
        enCoursDeModification: false,
      },
      {
        titre: 'Facture 3',
        commentaire: 'commentaire3',
        enCoursDeModification: false,
      },
    ];
  }

  sauvegarderCommentaire(facture: any) {
    console.log('modification de commentaire de la facture : ', facture.titre);
    facture.enCoursDeModification = true;
    // Simule un délai de traitement ou une requête réseau.
    setTimeout(() => {
      facture.enCoursDeModification = false;
    }, 2000); // Délai de 2 secondes.
  }

  afficherConfirmationSuppression(facture: any) {
    this.factureASupprimer = facture.titre;
  }

  confirmerSuppression() {
    console.log('Suppression de la facture : ', this.factureASupprimer);

    this.factures = this.factures.filter(
      (facture) => facture.titre !== this.factureASupprimer
    );

    this.factureASupprimer = null;
  }

  annulerSuppression() {
    this.factureASupprimer = null;
  }

  ajouterFacture() {
    console.log('ajouterFactureboutton');
    this.ajoutEnCours = true;
    setTimeout(() => {
      this.ajoutEnCours = false;
    }, 2000); // Délai de 2 secondes.
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  saveChanges() {
    this.dialogRef.close(this.factures);
  }
}
