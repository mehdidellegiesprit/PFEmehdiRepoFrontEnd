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
    private el: ElementRef
  ) {}

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

  public onFileInputChange(event: any): void {
    const file: File = event.target.files[0];
    this.subscriptions.push(
      this.bankStatementViewerService.uploadFile(file).subscribe(
        (response: any) => {
          console.log(response);
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

  onChange(event: any) {
    this.isYearSelected = false;
    this.selectedSociete = event.value;
    const foundReleveBancaire = this.releves.find(
      (releve: ReleveBancaire) =>
        (releve.id_societe as any)?.date ===
          (this.selectedSociete.id as any)?.date &&
        (releve.id_societe as any)?.timestamp ===
          (this.selectedSociete.id as any)?.timestamp
    );

    if (foundReleveBancaire) {
      this.selectedReleveBancaire = foundReleveBancaire;
      const distinctYears = this.getDistinctExtraitYears();
      if (distinctYears.length > 0) {
        this.selectedExtraitYear = distinctYears[0];
        this.onExtraitYearChange({ value: distinctYears[0] });
      }
      this.isSocieteSelected = true;

      setTimeout(() => this.updateCalendar(), 0);
    } else {
      this.selectedReleveBancaire = undefined;
      this.isSocieteSelected = false;
    }
  }
  @ViewChildren('.month') months: QueryList<ElementRef>;
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
      }, 500);
    } else {
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
  // il y a un probeleme dans cette methode !!! a voir !!!!
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
}
