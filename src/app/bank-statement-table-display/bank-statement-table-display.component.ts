import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
  Renderer2,
  ElementRef,
  ViewEncapsulation,
  QueryList,
  ViewChildren,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../service/notification.service';
import { BankStatementViewerService } from '../service/bank-statement-viewer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';
import { ReleveBancaire } from '../model/ReleveBancaire';
import { DatePipe } from '@angular/common';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SocieteService } from '../service/societe.service';
import { Societe } from '../model/Societe';
import { ExtraitBancaire } from '../model/ExtraitBancaire';
import { FullCalendarComponent } from '@fullcalendar/angular';
import * as XLSX from 'xlsx';
import { DonneeExtrait } from '../model/DonneeExtrait';
import {
  DialogData,
  FilterDialogComponent,
} from '../filter-dialog/filter-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { FileService } from '../service/file.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { MonthSelectorDialogComponent } from '../month-selector-dialog/month-selector-dialog.component';
import { MonthExporterFacturesComponent } from '../month-exporter-factures/month-exporter-factures.component';
@Component({
  selector: 'app-bank-statement-table-display',
  templateUrl: './bank-statement-table-display.component.html',
  styleUrls: ['./bank-statement-table-display.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class BankStatementTableDisplayComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  @ViewChild('invoiceDateRangeDialog') invoiceDateRangeDialog: TemplateRef<any>;
  dialogRefInvoice: MatDialogRef<any>;
  startDateInvoice: Date;
  endDateInvoice: Date;

  releves: ReleveBancaire[] = [];
  societes: Societe[] = [];
  private subscriptions: Subscription[] = [];
  isVisible = false;
  displayContent = false;
  selectedExtrait: ExtraitBancaire;
  private _selectedReleveBancaire?: ReleveBancaire;
  selectedYearExtraitDates: string[] = [];
  selectedSociete: Societe;
  selectedDate: Date = new Date();
  selectedExtraitYear: number = new Date().getFullYear();
  isYearSelected = false;
  isSocieteSelected = false;
  @ViewChildren('.month') months: QueryList<ElementRef>;

  public get selectedReleveBancaire(): ReleveBancaire | undefined {
    return this._selectedReleveBancaire;
  }

  public set selectedReleveBancaire(value: ReleveBancaire | undefined) {
    this._selectedReleveBancaire = value;
    if (value) {
      const distinctYears = this.getDistinctExtraitYears();
      if (distinctYears.length > 0) {
        this.selectedExtraitYear = distinctYears[0];
        this.updateCalendar();
      }
    }
  }

  constructor(
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private bankStatementViewerService: BankStatementViewerService,
    private societeService: SocieteService,
    private renderer: Renderer2,
    private el: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private fileService: FileService
  ) {}

  getDistinctExtraitYears(): number[] {
    const distinctYears: number[] = [];

    if (this.selectedReleveBancaire) {
      this.selectedReleveBancaire.extraits.forEach((extrait) => {
        const date = new Date(extrait.dateExtrait);
        const year = date.getFullYear();
        if (!distinctYears.includes(year)) {
          distinctYears.push(year);
        }
      });
    }

    return distinctYears;
  }

  onRIBSelect(event: any) {
    console.log('onRIBSelect !!!!!!');
    this.selectedRIB = event.value; // Mettez à jour le RIB sélectionné
    const foundReleveBancaire = this.releves.find(
      (releve) => releve.iban === this.selectedRIB
    );

    if (foundReleveBancaire) {
      // debut nouveau attribut facture valid
      console.log('***foundReleveBancaire***', foundReleveBancaire);
      console.log(
        '***facture***',
        foundReleveBancaire.extraits[0].donneeExtraits[0].factures
      );
      console.log(
        '***commentaire facture  : ',
        foundReleveBancaire.extraits[0].donneeExtraits[0].commentairesFactures
      );
      console.log(
        '***valide: ',
        foundReleveBancaire.extraits[0].donneeExtraits[0].valide
      );
      // fin  debut nouveau attribut facture valid

      this.selectedReleveBancaire = foundReleveBancaire;
      const distinctYears = this.getDistinctExtraitYears();
      if (distinctYears.length > 0) {
        this.selectedExtraitYear = distinctYears[0];
        this.onExtraitYearChange({ value: distinctYears[0] });
      }

      // Mettez à jour le calendrier
      setTimeout(() => this.updateCalendar(), 0);
    } else {
      this.selectedReleveBancaire = undefined;
    }
  }

  onChange(event: any) {
    this.isYearSelected = false;
    this.selectedSociete = event.value;

    // Filtrer les ReleveBancaires pour la Societe sélectionnée
    const foundReleveBancaires = this.releves.filter(
      (releve: ReleveBancaire) =>
        (releve.id_societe as any)?.date ===
          (this.selectedSociete.id as any)?.date &&
        (releve.id_societe as any)?.timestamp ===
          (this.selectedSociete.id as any)?.timestamp
    );

    if (foundReleveBancaires && foundReleveBancaires.length > 0) {
      this.selectedReleveBancaire = foundReleveBancaires[0];

      // Mettre à jour la liste des RIBs pour la Societe sélectionnée
      this.ribList = foundReleveBancaires.map((releve) => releve.iban);

      const distinctYears = this.getDistinctExtraitYears();
      if (distinctYears.length > 0) {
        this.selectedExtraitYear = distinctYears[0];
        this.onExtraitYearChange({ value: distinctYears[0] });
      }
      this.isSocieteSelected = true;

      setTimeout(() => this.updateCalendar(), 0);
    } else {
      this.selectedReleveBancaire = undefined;
      this.ribList = []; // Réinitialiser la liste des RIBs si aucune Societe n'est sélectionnée
      this.isSocieteSelected = false;
    }

    this.changeDetectorRef.detectChanges(); // Trigger change detection
  }

  ribList: string[] = [];
  selectedRIB: string; // Add this line
  getRibsForSelectedSociete() {
    // Assuming releves is your array of ReleveBancaire instances
    console.log('getRibsForSelectedSociete');
    const relevesForSociete = this.releves.filter(
      (releve) => releve.id_societe === this.selectedSociete.id
    );
    this.ribList = relevesForSociete.map((releve) => releve.iban);
    this.changeDetectorRef.detectChanges(); // trigger change detection
  }

  //************************************************************** */ mahomech de5linnnnn
  updateCalendar(): void {
    if (this.selectedReleveBancaire && !isNaN(this.selectedExtraitYear)) {
      setTimeout(() => {
        this.selectedYearExtraitDates =
          this.selectedReleveBancaire?.extraits
            .filter(
              (extrait) =>
                new Date(extrait.dateExtrait).getFullYear() ===
                this.selectedExtraitYear
            )
            .map((extrait) =>
              this.convertDate(
                (extrait.dateExtrait instanceof Date
                  ? extrait.dateExtrait
                  : new Date(extrait.dateExtrait)
                ).toISOString()
              )
            ) || [];

        this.colorerCelluleMois(this.selectedYearExtraitDates);
      }, 0);
    } else {
      // Handle case when no releve is selected or selectedExtraitYear is NaN
    }
  }

  convertFrenchDate(dateString: string): Date {
    const months = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ];

    const [day, month, year] = dateString.split(' ');
    const monthNumber = months.indexOf(month.toLowerCase()) + 1;

    return new Date(Number(year), monthNumber - 1, Number(day));
  }

  onExtraitDateChange(event: any): void {
    this.selectedDate = new Date(event.value);
  }

  getValeurSuivante() {
    const distinctYears = this.getDistinctExtraitYears();
    const currentIndex = distinctYears.indexOf(this.selectedExtraitYear);

    if (currentIndex < distinctYears.length - 1) {
      this.selectedExtraitYear = distinctYears[currentIndex + 1];
      this.updateCalendar();
    }
  }

  getValeurPrecedente() {
    const distinctYears = this.getDistinctExtraitYears();
    const currentIndex = distinctYears.indexOf(this.selectedExtraitYear);

    if (currentIndex > 0) {
      this.selectedExtraitYear = distinctYears[currentIndex - 1];
      this.updateCalendar();
    }
  }
  // il y a un problème dans cette méthode !!! a voir !!!!
  colorerCelluleMois(dates: string[]): void {
    const monthsToColor = dates.map((date) => {
      const [year, month] = this.convertFrenchDate(date)
        .toISOString()
        .slice(0, 7)
        .split('-');
      return `${year}-${month}`;
    });

    const frenchMonths = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];

    const calendarMonths = document.querySelectorAll('.month');

    calendarMonths.forEach((monthCard, index) => {
      const cardMonth = frenchMonths[index];
      const cardDate = `${this.selectedExtraitYear}-${('0' + (index + 1)).slice(
        -2
      )}`;

      if (monthsToColor.includes(cardDate)) {
        monthCard.classList.add('colored-month');
        monthCard.setAttribute(
          'title',
          `Cliquez ici pour plus de détails sur l'extrait de ${cardMonth}`
        );
      } else {
        monthCard.classList.remove('colored-month');
        monthCard.setAttribute('title', '');
      }

      if (!monthCard.classList.contains('event-added')) {
        monthCard.classList.add('event-added');
        monthCard.addEventListener('click', () => {
          if (monthCard.classList.contains('colored-month')) {
            console.log(`Vous avez cliqué sur un mois coloré: ${cardMonth}`);
            this.onEventClick_colored_month(cardMonth);
          }
        });

        monthCard.addEventListener('mouseenter', () => {
          if (monthCard.classList.contains('colored-month')) {
            console.log(`mouseenter`);
            monthCard.classList.add('hover-color');
          }
        });

        monthCard.addEventListener('mouseleave', () => {
          if (monthCard.classList.contains('colored-month')) {
            console.log(`mouseleave`);
            monthCard.classList.remove('hover-color');
          }
        });
      }
    });
  }

  onExtraitYearChange(event: any): void {
    this.selectedExtraitYear = Number(event.value);

    if (!isNaN(this.selectedExtraitYear)) {
      this.isYearSelected = true;
      this.selectedYearExtraitDates =
        this.selectedReleveBancaire?.extraits
          .filter(
            (extrait) =>
              new Date(extrait.dateExtrait).getFullYear() ===
              this.selectedExtraitYear
          )
          .map((extrait) =>
            this.convertDate(
              (extrait.dateExtrait instanceof Date
                ? extrait.dateExtrait
                : new Date(extrait.dateExtrait)
              ).toISOString()
            )
          ) || [];

      this.colorerCelluleMois(this.selectedYearExtraitDates);
      this.updateCalendar();
    } else {
      this.isYearSelected = false;
    }
  }
  onEventClick_colored_month(month: string): void {
    console.log('onEventClick');

    const months = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ];

    const monthNumber = months.indexOf(month.toLowerCase());
    if (monthNumber === -1) {
      console.log('Invalid month:', month);
      return;
    }

    if (this.selectedReleveBancaire && this.selectedReleveBancaire.extraits) {
      const matchingExtrait = this.selectedReleveBancaire.extraits.find(
        (extrait) => {
          if (typeof extrait.dateExtrait === 'string') {
            const extraitDate = new Date(extrait.dateExtrait);
            return extraitDate.getMonth() === monthNumber;
          }
          return false;
        }
      );

      if (matchingExtrait) {
        this.selectedExtrait = matchingExtrait;
        this.displayContent = true;
      } else {
        console.log('No matching extrait found for month:', month);
      }
    } else {
      console.log('No selected releve or extrait available');
    }
  }
  // public onFileInputChange(event: any): void {
  //   const file: File = event.target.files[0];
  //   this.subscriptions.push(
  //     this.bankStatementViewerService.uploadFile(file).subscribe(
  //       (response: any) => {
  //         console.log(response);
  //       },
  //       (errorResponse: HttpErrorResponse) => {
  //         this.notificationService.notify(
  //           NotificationType.ERROR,
  //           errorResponse.error.message
  //         );
  //       }
  //     )
  //   );
  // }
  formatDate(date: any): string {
    if (date) {
      return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
    }
    return '';
  }

  convertDate(dateString: string | null): string {
    if (dateString) {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    }
    return '';
  }

  public getAllRelevesBancaires(): void {
    this.subscriptions.push(
      this.bankStatementViewerService.getAllRelevesBancaires().subscribe(
        (response: ReleveBancaire[]) => {
          this.releves = response;
          console.log('**releves:', this.releves);
        },
        (errorResponse: HttpErrorResponse) => {
          this.notificationService.notify(
            NotificationType.ERROR,
            errorResponse.error.message
          );
        }
      )
    );
  }

  public getAllSocietes(): void {
    this.subscriptions.push(
      this.societeService.getAllSocietes().subscribe(
        (response: Societe[]) => {
          this.societes = response;
          //console.log('*****societes:', this.societes);
        },
        (errorResponse: HttpErrorResponse) => {
          this.notificationService.notify(
            NotificationType.ERROR,
            errorResponse.error.message
          );
        }
      )
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.bankStatementViewerService.getAllRelevesBancaires().subscribe(
        (response: ReleveBancaire[]) => {
          this.releves = response;
          //console.log('**releves:', this.releves);

          // Call getAllSocietes after fetching the releves data
          this.getAllSocietes();
        },
        (errorResponse: HttpErrorResponse) => {
          this.notificationService.notify(
            NotificationType.ERROR,
            errorResponse.error.message
          );
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngAfterViewInit(): void {
    this.updateCalendar();
    this.colorerCelluleMois(this.selectedYearExtraitDates);

    // Run the code to update the title attribute after a delay to ensure that the month cells have been colored.
    setTimeout(() => {
      this.months.forEach((month) => {
        const backgroundColor = window.getComputedStyle(
          month.nativeElement
        ).backgroundColor;
        const monthText = month.nativeElement.innerText;

        if (backgroundColor === 'rgb(255, 153, 0)') {
          // equivalent of #ff9900
          month.nativeElement.setAttribute(
            'title',
            `Cliquez ici pour plus de détails sur l'extrait de ${monthText}`
          );
        } else {
          month.nativeElement.setAttribute('title', '');
        }

        this.renderer.listen(month.nativeElement, 'mouseenter', () => {
          if (month.nativeElement.classList.contains('colored-month')) {
            console.log(`mouseenter`);
            this.renderer.addClass(month.nativeElement, 'hover-color');
          }
        });

        this.renderer.listen(month.nativeElement, 'mouseleave', () => {
          if (month.nativeElement.classList.contains('colored-month')) {
            console.log(`mouseleave`);
            this.renderer.removeClass(month.nativeElement, 'hover-color');
          }
        });
      });
    }, 0);
  }
  searchExtraitByDate(date: Date): ExtraitBancaire | null {
    const searchDateStr = date.toISOString().slice(0, 10);

    for (const extrait of this._selectedReleveBancaire!.extraits) {
      const extraitDateStr = extrait.dateExtrait.toISOString().slice(0, 10);
      if (extraitDateStr === searchDateStr) {
        return extrait;
      }
    }
    return null;
  }

  // Helper method for date comparison
  areDatesEqual(date1: Date, date2: Date): boolean {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
      throw new TypeError('Both arguments must be instances of Date');
    }

    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  exportexcel(filters: any): number {
    console.log(
      'Initial data.length:',
      this.selectedExtrait.donneeExtraits.length
    );

    let dataToExport: DonneeExtrait[] = [
      ...this.selectedExtrait.donneeExtraits,
    ];

    // Convertir les filtres en instances de Date si nécessaire
    const startDate =
      filters.startDate !== undefined
        ? new Date(
            filters.startDate instanceof Date
              ? filters.startDate
              : new Date(filters.startDate)
          ).setHours(0, 0, 0, 0)
        : null;
    const endDate =
      filters.endDate !== undefined
        ? new Date(
            filters.endDate instanceof Date
              ? filters.endDate
              : new Date(filters.endDate)
          ).setHours(24, 0, 0, 0) // change to 24
        : null;

    const startDateValeur =
      filters.startDateValeur !== undefined
        ? new Date(
            filters.startDateValeur instanceof Date
              ? filters.startDateValeur
              : new Date(filters.startDateValeur)
          ).setHours(0, 0, 0, 0)
        : null;
    const endDateValeur =
      filters.endDateValeur !== undefined
        ? new Date(
            filters.endDateValeur instanceof Date
              ? filters.endDateValeur
              : new Date(filters.endDateValeur)
          ).setHours(23, 59, 59, 999)
        : null;

    // Ajouter ces lignes pour afficher les dates converties
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);
    console.log('startDateValeur:', startDateValeur);
    console.log('endDateValeur:', endDateValeur);
    // Appliquer les filtres en fonction des valeurs de `filters`

    if (startDate !== null) {
      dataToExport = dataToExport.filter(
        (row: DonneeExtrait) =>
          new Date(row.dateDonneeExtrait).setHours(0, 0, 0, 0) >= startDate
      );
    }
    console.log('startDate----startDate.length :', dataToExport.length);

    if (endDate !== null) {
      dataToExport = dataToExport.filter(
        (row: DonneeExtrait) =>
          new Date(row.dateDonneeExtrait).setHours(23, 59, 59, 999) <= endDate
      );
    }
    console.log('endDate----endDate.length :', dataToExport.length);

    if (startDateValeur !== null) {
      dataToExport = dataToExport.filter((row: DonneeExtrait) => {
        const rowDate = new Date(row.dateValeurDonneeExtrait);
        const filterDate = new Date(startDateValeur);
        const isInRange =
          new Date(
            rowDate.getFullYear(),
            rowDate.getMonth(),
            rowDate.getDate()
          ) >=
          new Date(
            filterDate.getFullYear(),
            filterDate.getMonth(),
            filterDate.getDate()
          );
        if (!isInRange) {
          console.log(
            'Dropped by startDateValeur: ',
            row.uuid,
            'rowDate: ',
            rowDate,
            'filterDate: ',
            filterDate
          );
        }
        return isInRange;
      });
    }
    // Do the same for endDateValeur

    console.log(
      'startDateValeur----dataToExport.length :',
      dataToExport.length
    );

    if (endDateValeur !== null) {
      dataToExport = dataToExport.filter((row: DonneeExtrait) => {
        const rowDate = new Date(row.dateValeurDonneeExtrait);
        const filterDate = new Date(endDateValeur);
        return (
          new Date(
            rowDate.getFullYear(),
            rowDate.getMonth(),
            rowDate.getDate()
          ) <=
          new Date(
            filterDate.getFullYear(),
            filterDate.getMonth(),
            filterDate.getDate()
          )
        );
      });
    }

    console.log('endDateValeur----dataToExport.length :', dataToExport.length);

    if (filters.debitMin) {
      dataToExport = dataToExport.filter(
        (row: DonneeExtrait) => row.debit >= filters.debitMin
      );
    }

    if (filters.debitMax) {
      dataToExport = dataToExport.filter(
        (row: DonneeExtrait) => row.debit <= filters.debitMax
      );
    }

    if (filters.creditMin) {
      dataToExport = dataToExport.filter(
        (row: DonneeExtrait) => row.credit >= filters.creditMin
      );
    }

    if (filters.creditMax) {
      dataToExport = dataToExport.filter(
        (row: DonneeExtrait) => row.credit <= filters.creditMax
      );
    }

    if (filters.operation) {
      const operationFilterLowercase = filters.operation.toLowerCase();
      dataToExport = dataToExport.filter((row: DonneeExtrait) =>
        row.operations.toLowerCase().includes(operationFilterLowercase)
      );
    }
    console.log('dataToExport.length :', dataToExport.length);
    // Check if there's any data to export
    if (dataToExport.length === 0) {
      console.log("No data to export. Excel file won't be created.");
      return 0;
    }
    // Après avoir appliqué les filtres, mappez les données pour l'exportation
    const mappedData = dataToExport.map((row: DonneeExtrait) => {
      return {
        'date extrait': new Date(row.dateDonneeExtrait).toLocaleDateString(
          'fr-FR'
        ),
        'date valeur extrait': new Date(
          row.dateValeurDonneeExtrait
        ).toLocaleDateString('fr-FR'),
        opérations: row.operations.replace(/\*\*\*/g, '\n'),
        'débit (€)': row.debit,
        'crédit (€)': row.credit,
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(mappedData, {
      cellStyles: true,
    });

    const wscols = [
      { wch: 20 },
      { wch: 20 },
      { wch: 60 },
      { wch: 20 },
      { wch: 20 },
    ];

    ws['!cols'] = wscols;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    const filename = `export_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.xlsx`;

    XLSX.writeFile(wb, filename);
    return mappedData.length;
  }

  openDialog(): void {
    let data = {
      startDate: null as Date | null,
      endDate: null as Date | null,
      startDateValeur: null as Date | null,
      endDateValeur: null as Date | null,
      debitMin: 0,
      debitMax: 0,
      creditMin: 0,
      creditMax: 0,
      operation: '',
    };

    if (this.selectedExtrait) {
      const sortedDonneeExtraits = [
        ...this.selectedExtrait.donneeExtraits,
      ].sort(
        (a, b) =>
          new Date(a.dateValeurDonneeExtrait).getTime() -
          new Date(b.dateValeurDonneeExtrait).getTime()
      );
      const sortedDonneeExtraitsDate = [
        ...this.selectedExtrait.donneeExtraits,
      ].sort(
        (a, b) =>
          new Date(a.dateDonneeExtrait).getTime() -
          new Date(b.dateDonneeExtrait).getTime()
      );

      data = {
        startDate: sortedDonneeExtraitsDate[0].dateDonneeExtrait,
        endDate:
          sortedDonneeExtraitsDate[sortedDonneeExtraitsDate.length - 1]
            .dateDonneeExtrait,
        startDateValeur: sortedDonneeExtraits[0].dateValeurDonneeExtrait,
        endDateValeur:
          sortedDonneeExtraits[sortedDonneeExtraits.length - 1]
            .dateValeurDonneeExtrait,
        debitMin: Math.min(
          ...this.selectedExtrait.donneeExtraits.map((de) => de.debit)
        ),
        debitMax: Math.max(
          ...this.selectedExtrait.donneeExtraits.map((de) => de.debit)
        ),
        creditMin: Math.min(
          ...this.selectedExtrait.donneeExtraits.map((de) => de.credit)
        ),
        creditMax: Math.max(
          ...this.selectedExtrait.donneeExtraits.map((de) => de.credit)
        ),
        operation: '',
      };
    }

    const dialogRef = this.dialog.open(FilterDialogComponent, {
      width: '45%',
      height: '50%',
      data: data,
    });

    // Abonnement à l'événement personnalisé "apply" du composant de dialogue
    dialogRef.componentInstance.apply.subscribe(async (result: DialogData) => {
      console.log('Appliquer clicked');
      const rowCount = this.exportexcel(result);

      let title = 'Information';
      let text = '';
      let icon: SweetAlertIcon = 'info';

      if (rowCount > 0) {
        text = `Fichier Excel généré avec succès, contenant ${rowCount} lignes.`;
        icon = 'success';
      } else {
        text = `Aucun résultat trouvé.`;
        icon = 'error';
      }

      await Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });
    });

    // Si vous souhaitez également faire quelque chose lorsque la boîte de dialogue est fermée (par exemple, en cliquant sur un bouton "Annuler")
    dialogRef.afterClosed().subscribe(() => {
      console.log('La fenêtre modale a été fermée');
    });
  }
  // deb factures!!
  displayInvoices() {
    console.log('Affichage des factures pour la période sélectionnée...');
  }
  openInvoiceDateRangeDialog(): void {
    this.dialogRefInvoice = this.dialog.open(this.invoiceDateRangeDialog);
  }

  applyInvoiceDateRange() {
    console.log('Date de début:', this.startDateInvoice);
    console.log('Date de fin:', this.endDateInvoice);
    console.log(
      'Initial data.length:',
      this.selectedExtrait.donneeExtraits.length
    );

    let filteredData = this.selectedExtrait.donneeExtraits.filter((donnee) => {
      let donneeDate = new Date(donnee.dateDonneeExtrait);

      let startDate = new Date(
        Date.UTC(
          this.startDateInvoice.getUTCFullYear(),
          this.startDateInvoice.getUTCMonth(),
          this.startDateInvoice.getUTCDate()
        )
      );

      let endDate = new Date(
        Date.UTC(
          this.endDateInvoice.getUTCFullYear(),
          this.endDateInvoice.getUTCMonth(),
          this.endDateInvoice.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );

      endDate.setUTCHours(23, 59, 59, 999);

      return donneeDate >= startDate && donneeDate <= endDate;
    });

    let downloadPromises: Promise<{
      blob: Blob;
      filename: string;
      folderName: string;
    }>[] = [];

    filteredData.forEach((donnee) => {
      if (Object.keys(donnee.associationTitreUrl).length > 0) {
        for (let url of Object.values(donnee.associationTitreUrl)) {
          if (url) {
            let folderName = this.formatDateInvoice(donnee.dateDonneeExtrait);
            console.log(url, 'Date associée:', folderName);

            let downloadPromise = this.downloadPdf(url, folderName);
            downloadPromises.push(downloadPromise);
          }
        }
      }
    });

    Promise.all(downloadPromises)
      .then(async (fileObjects) => {
        let title = 'Information';
        let text = '';
        let icon: SweetAlertIcon = 'info';

        if (fileObjects.length === 0) {
          text = `Aucune facture n'a été trouvée dans la période du ${this.formatDateInvoice(
            this.startDateInvoice
          ).replace(/_/g, ' ')} au ${this.formatDateInvoice(
            this.endDateInvoice
          ).replace(/_/g, ' ')}.`;
          icon = 'error';
        } else {
          let zip = new JSZip();

          fileObjects.forEach(({ blob, filename, folderName }) => {
            console.log('Adding to ZIP:', folderName + '/' + filename);
            zip.file(folderName + '/' + filename, blob);
          });

          const timestamp = new Date().toISOString();
          await zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, `archive_${timestamp}.zip`);
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
      })
      .catch((error) => {
        console.error(
          'Une erreur est survenue lors du téléchargement des fichiers:',
          error
        );
      });

    // pour fermer la modal de/commenter cette ligne bro !
    // this.dialogRefInvoice.close();
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

  cancelInvoiceDateRange(): void {
    // Utilisez la référence pour fermer le dialogue.
    this.dialogRefInvoice.close();
  }
  formatDateInvoice(date: any): string {
    if (date) {
      const adjustedDate = new Date(date);
      adjustedDate.setMinutes(
        adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset()
      );

      const day = adjustedDate.getDate();
      const year = adjustedDate.getFullYear();

      const monthNames = [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
      ];
      const monthName = monthNames[adjustedDate.getMonth()];

      return `${day.toString().padStart(2, '0')}_${monthName}_${year}`;
    }
    return '';
  }
  dateFilter = (d: Date | null): boolean => {
    const date = d || new Date();

    // Conversion de la chaîne de date en objet Date
    const extractedDate = new Date(this.selectedExtrait.dateExtrait);

    // Extraction de l'année et du mois
    const allowedYear = extractedDate.getFullYear();
    const allowedMonth = extractedDate.getMonth();

    console.log('me oh !! extrait !!!!!! ', this.selectedExtrait.dateExtrait);

    return (
      date.getFullYear() === allowedYear && date.getMonth() === allowedMonth
    );
  };

  // end factures!!

  InterfaceGlobaleExport(): void {
    console.log('chouf!!', this._selectedReleveBancaire);
    const dialogRef = this.dialog.open(MonthSelectorDialogComponent, {
      data: { releveBancaire: this._selectedReleveBancaire },
      width: '450px', // Définissez la largeur souhaitée
      height: '250px', // Définissez la hauteur souhaitée
    });

    dialogRef.afterClosed().subscribe((selectedMonth) => {
      if (selectedMonth) {
        // Traitement avec le mois sélectionné (ex. exportation)
      }
    });
  }
  InterfaceGlobaleFacture(): void {
    console.log('chouf!!', this._selectedReleveBancaire);
    const dialogRef = this.dialog.open(MonthExporterFacturesComponent, {
      data: { releveBancaire: this._selectedReleveBancaire },
      width: '450px', // Définissez la largeur souhaitée
      height: '250px', // Définissez la hauteur souhaitée
    });

    dialogRef.afterClosed().subscribe((selectedMonth) => {
      if (selectedMonth) {
        // Traitement avec le mois sélectionné (ex. exportation)
      }
    });
  }
}
