import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
})
export class FilterDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
