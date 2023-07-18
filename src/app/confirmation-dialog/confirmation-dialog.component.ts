import { Component, Inject, ViewEncapsulation } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css'],
  encapsulation: ViewEncapsulation.None, // Add this line
})
export class ConfirmationDialogComponent {
  message: string = 'Voulez-vous vraiment effectuer cette action?'; // Message par défaut

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.message = data;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
