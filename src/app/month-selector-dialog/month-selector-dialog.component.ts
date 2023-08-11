import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReleveBancaire } from '../model/ReleveBancaire';
import * as XLSX from 'xlsx';
import { DonneeExtrait } from '../model/DonneeExtrait';

@Component({
  selector: 'app-month-selector-dialog',
  templateUrl: './month-selector-dialog.component.html',
})
export class MonthSelectorDialogComponent {
  months: { name: string; value: number }[] = [];
  selectedMonths: number[] = []; // Utilisation d'un tableau pour contenir les mois sélectionnés
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
    const selectedMonthsDetails = this.months.filter((month) =>
      this.selectedMonths.includes(month.value)
    );

    console.log('Selected Months:', selectedMonthsDetails);

    this.data.releveBancaire.extraits.forEach((extrait) => {
      const extraitDate = new Date(extrait.dateExtrait);
      if (this.selectedMonths.includes(extraitDate.getMonth() + 1)) {
        console.log('Found selected month in extraits:', extrait);
      }
    });

    this.exportSelectedDataToExcel(
      this.data.releveBancaire,
      this.selectedMonths
    ); // Appelle la méthode d'exportation
    this.dialogRef.close(this.selectedMonths); // Retourne les mois sélectionnés
  }

  exportSelectedDataToExcel(
    releveBancaire: ReleveBancaire,
    selectedMonths: number[]
  ): number {
    // Modifié pour renvoyer le nombre de lignes exportées
    const workbook = XLSX.utils.book_new();
    let totalRows = 0;

    releveBancaire.extraits.forEach((extraitBancaire) => {
      const date = new Date(extraitBancaire.dateExtrait);
      const monthIndex = date.getMonth() + 1;
      const sheetName = new Intl.DateTimeFormat('fr-FR', {
        month: 'long',
        year: 'numeric',
      }).format(date);

      if (selectedMonths.includes(monthIndex)) {
        const data = extraitBancaire.donneeExtraits.map((donneeExtrait) => {
          return {
            'date extrait': new Date(
              donneeExtrait.dateDonneeExtrait
            ).toLocaleDateString('fr-FR'), // Ajouté pour le formatage
            'date valeur extrait': new Date(
              donneeExtrait.dateValeurDonneeExtrait
            ).toLocaleDateString('fr-FR'), // Ajouté pour le formatage
            opérations: donneeExtrait.operations.replace(/\*\*\*/g, '\n'), // Ajouté pour le formatage
            'débit (€)': donneeExtrait.debit,
            'crédit (€)': donneeExtrait.credit,
          };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Présentation dans Excel
        const wscols = [
          { wch: 20 },
          { wch: 20 },
          { wch: 60 },
          { wch: 20 },
          { wch: 20 },
        ];
        worksheet['!cols'] = wscols;

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        totalRows += data.length;
      }
    });

    const fileName = 'releve-bancaire.xlsx';
    XLSX.writeFile(workbook, fileName);

    return totalRows; // Retour du nombre total de lignes exportées
  }
}
