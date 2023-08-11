import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReleveBancaire } from '../model/ReleveBancaire';
import * as XLSX from 'xlsx';
import { DonneeExtrait } from '../model/DonneeExtrait';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { FileService } from '../service/file.service';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-month-exporter-factures',
  templateUrl: './month-exporter-factures.component.html',
  styleUrls: ['./month-exporter-factures.component.css'],
})
export class MonthExporterFacturesComponent {
  public dialogTitle: string = 'Sélectionnez les mois à exporter';
  months: { name: string; value: number }[] = [];
  selectedMonths: number[] = []; // Utilisation d'un tableau pour contenir les mois sélectionnés
  constructor(
    private fileService: FileService,
    public dialogRef: MatDialogRef<MonthExporterFacturesComponent>,
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

    this.exportSelectedDataFactureToZip(
      this.data.releveBancaire,
      this.selectedMonths
    ); // Appelle la méthode d'exportation
    this.dialogRef.close(this.selectedMonths); // Retourne les mois sélectionnés
  }

  downloadPdf(
    url: string,
    folderName: string
  ): Promise<{ blob: Blob; filename: string; folderName: string }> {
    return this.fileService
      .downloadFile(url)
      .toPromise()
      .then((data) => {
        if (!data) {
          throw new Error('No data returned from file download');
        }
        const blob = new Blob([data], { type: 'application/pdf' });

        let urlComponents = url.split('/');
        // Filtrons le segment 'yt' du chemin du fichier
        urlComponents = urlComponents.filter((segment) => segment !== 'yt');
        // Prenez le dernier segment de l'URL modifiée, qui devrait être le nom du fichier
        let filename = urlComponents[urlComponents.length - 1].split('?')[0];
        filename = decodeURIComponent(filename);

        // Log pour le débogage
        console.log('Filtered URL Components:', urlComponents);
        console.log('Final Filename:', filename);

        return { blob, filename, folderName };
      });
  }

  exportSelectedDataFactureToZip(
    releveBancaire: ReleveBancaire,
    selectedMonths: number[]
  ): number {
    const workbook = XLSX.utils.book_new();
    let totalRows = 0;

    let sheetNamesUsed: { [key: string]: number } = {};

    releveBancaire.extraits.forEach((extraitBancaire) => {
      const date = new Date(extraitBancaire.dateExtrait);
      const monthIndex = date.getMonth() + 1;
      let sheetName = new Intl.DateTimeFormat('fr-FR', {
        month: 'long',
        year: 'numeric',
      }).format(date);

      // Vérifie si le nom de la feuille est déjà utilisé et ajoute un indice si nécessaire
      if (sheetNamesUsed[sheetName]) {
        sheetNamesUsed[sheetName]++;
        sheetName = `${sheetName} (${sheetNamesUsed[sheetName]})`;
      } else {
        sheetNamesUsed[sheetName] = 1;
      }

      if (selectedMonths.includes(monthIndex)) {
        const data = extraitBancaire.donneeExtraits.map((donneeExtrait) => {
          return {
            'date extrait': new Date(
              donneeExtrait.dateDonneeExtrait
            ).toLocaleDateString('fr-FR'),
            'date valeur extrait': new Date(
              donneeExtrait.dateValeurDonneeExtrait
            ).toLocaleDateString('fr-FR'),
            opérations: donneeExtrait.operations.replace(/\*\*\*/g, '\n'),
            'débit (€)': donneeExtrait.debit,
            'crédit (€)': donneeExtrait.credit,
          };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
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

    const currentDateTime = new Date();
    const formattedDateTime = `${currentDateTime.getFullYear()}-${(
      '0' +
      (currentDateTime.getMonth() + 1)
    ).slice(-2)}-${('0' + currentDateTime.getDate()).slice(-2)}_${(
      '0' + currentDateTime.getHours()
    ).slice(-2)}-${('0' + currentDateTime.getMinutes()).slice(-2)}-${(
      '0' + currentDateTime.getSeconds()
    ).slice(-2)}`;

    const fileName = `releve-bancaire_${formattedDateTime}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return totalRows;
  }

  async downloadInvoicesForSelectedMonths() {
    console.log('methodes factureeessss!!!!!');
    // Filtrer les extraits pour les mois sélectionnés par l'utilisateur
    const selectedExtraits = this.data.releveBancaire.extraits.filter(
      (extrait) => {
        const date = new Date(extrait.dateExtrait);
        return this.selectedMonths.includes(date.getMonth() + 1);
      }
    );

    let downloadPromises: Promise<{
      blob: Blob;
      filename: string;
      folderName: string;
    }>[] = [];

    selectedExtraits.forEach((extrait) => {
      extrait.donneeExtraits.forEach((donnee) => {
        if (Object.keys(donnee.associationTitreUrl).length > 0) {
          for (let url of Object.values(donnee.associationTitreUrl)) {
            if (url) {
              let folderName = this.formatDate(new Date(extrait.dateExtrait));
              let downloadPromise = this.downloadPdf(url, folderName);
              downloadPromises.push(downloadPromise);
            }
          }
        }
      });
    });

    // Regrouper les factures téléchargées dans un fichier ZIP pour le téléchargement
    Promise.all(downloadPromises)
      .then(async (fileObjects) => {
        let title = 'Information';
        let text = '';
        let icon: SweetAlertIcon = 'info';

        if (fileObjects.length === 0) {
          text = `Aucune facture n'a été trouvée pour les mois sélectionnés.`;
          icon = 'error';
        } else {
          let zip = new JSZip();

          fileObjects.forEach(({ blob, filename, folderName }) => {
            zip.file(folderName + '/' + filename, blob);
          });

          const timestamp = new Date().toISOString();
          await zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, `factures_${timestamp}.zip`);
          });

          text = `Les factures ont été téléchargées avec succès. Vérifiez vos téléchargements.`;
          icon = 'success';
        }

        await Swal.fire({
          title: title,
          text: text,
          icon: icon,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        });

        // fermer la boîte de dialogue après le téléchargement
        this.dialogRef.close();
      })
      .catch((error) => {
        console.error(
          'Une erreur est survenue lors du téléchargement des fichiers:',
          error
        );
      });
  }
}
