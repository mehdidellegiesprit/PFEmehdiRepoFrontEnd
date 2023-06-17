import { Component, Injectable, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DonneeExtrait } from '../model/DonneeExtrait';

@Component({
  selector: 'app-modal-facture',
  templateUrl: './modal-facture.component.html',
  styleUrls: ['./modal-facture.component.css'],
})
@Injectable() // Add this line
export class ModalFactureComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ModalFactureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DonneeExtrait
  ) {}

  ngOnInit(): void {}

  // Ajoute une nouvelle facture.
  ajouterFacture() {
    console.log("Ajout d'une nouvelle facture.");
  }

  // Supprime une facture existante.
  supprimerFacture() {
    console.log("Suppression d'une facture.");
  }

  // Ajoute un commentaire à une facture existante.
  ajouterCommentaire() {
    console.log("Ajout d'un commentaire.");
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  saveChanges(): void {
    // Implement your logic here
    this.closeModal();
  }
}
