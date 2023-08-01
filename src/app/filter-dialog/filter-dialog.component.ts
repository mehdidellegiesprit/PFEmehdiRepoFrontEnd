import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Options } from 'ng5-slider'; // Assurez-vous d'importer `Options` de 'ng5-slider'

export interface DialogData {
  startDate: Date;
  endDate: Date;
  startDateValeur: Date;
  endDateValeur: Date;
  minDebit: number;
  maxDebit: number;
  minCredit: number;
  maxCredit: number;
  operation: string;
}

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class FilterDialogComponent {
  options: Options = {
    floor: 0,
    ceil: 10000,
    step: 10,
  };
  debitSliderOptions: Options = {
    floor: 0,
    ceil: 10000,
    step: 10,
  };

  creditSliderOptions: Options = {
    floor: 0,
    ceil: 10000,
    step: 10,
  };

  // Votre tooltipDisplay doit être défini ici aussi.
  // Pour le moment, nous allons simplement le définir pour qu'il soit toujours visible.
  tooltipDisplay = 'always';
  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
