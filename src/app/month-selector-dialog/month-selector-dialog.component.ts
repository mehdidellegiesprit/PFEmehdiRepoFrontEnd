import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReleveBancaire } from '../model/ReleveBancaire';

@Component({
  selector: 'app-month-selector-dialog',
  templateUrl: './month-selector-dialog.component.html',
})
export class MonthSelectorDialogComponent {
  months: { name: string; value: number }[] = [];
  selectedMonth: number;

  constructor(
    public dialogRef: MatDialogRef<MonthSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { releveBancaire: ReleveBancaire }
  ) {
    console.log('ReleveBancaire Data:', this.data.releveBancaire); // Log the entire ReleveBancaire data

    this.data.releveBancaire.extraits.forEach((extrait) => {
      // Log each dateExtrait to check if they are valid dates
      console.log('Date Extrait:', extrait.dateExtrait);
    });

    // Filter and map the valid dates
    this.months = this.data.releveBancaire.extraits
      .filter((extrait) => !isNaN(new Date(extrait.dateExtrait).getTime())) // Filtering invalid dates
      .map((extrait) => {
        const date = new Date(extrait.dateExtrait);
        return {
          name: this.formatDate(date),
          value: date.getMonth() + 1,
        };
      });

    console.log('Months:', this.months); // Log the mapped months
  }

  formatDate(date: Date): string {
    // Log the date inside the formatDate method
    console.log('Formatting date:', date);

    // Formatez la date comme vous le souhaitez, par exemple en utilisant l'objet Intl.DateTimeFormat
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close(this.selectedMonth);
  }
}
