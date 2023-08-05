import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  startDate: Date;
  endDate: Date;
  startDateValeur: Date;
  endDateValeur: Date;
  debitMin: number;
  debitMax: number;
  creditMin: number;
  creditMax: number;
  operation: string;
}

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.css'],
})
export class FilterDialogComponent {
  @Output() apply = new EventEmitter<DialogData>();
  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  applyFilter(event: Event) {
    event.stopPropagation();
    // Ajoutez ici la logique pour appliquer le filtre
    // Vous pouvez manipuler this.data selon vos besoins

    // Émettez l'événement avec les données filtrées (ici, j'assume que this.data contient les données filtrées)
    this.apply.emit(this.data);
  }
}
