import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
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
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Renderer2, ElementRef } from '@angular/core';

import { Calendar, LocaleInput } from '@fullcalendar/core';
import frLocale from '@fullcalendar/core/locales/fr';
@Component({
  selector: 'app-bank-statement-table-display',
  templateUrl: './bank-statement-table-display.component.html',
  styleUrls: ['./bank-statement-table-display.component.css'],
})
export class BankStatementTableDisplayComponent implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // Here we get a reference to the calendar
  releves: ReleveBancaire[] = [];
  societes: Societe[] = [];
  private subscription: Subscription[] = [];
  isVisible = false; // Initialize as hidden

  private _selectedReleveBancaire?: ReleveBancaire;

  public get selectedReleveBancaire(): ReleveBancaire | undefined {
    return this._selectedReleveBancaire;
  }

  public set selectedReleveBancaire(value: ReleveBancaire | undefined) {
    this._selectedReleveBancaire = value;
    if (value) {
      let distinctYears = this.getDistinctExtraitYears();
      if (distinctYears.length > 0) {
        // Set selectedExtraitYear to the first year in the list
        this.selectedExtraitYear = distinctYears[0];
        this.updateCalendar();
      }
    }
  }

  onToggle(id_div: string): void {
    const divElement = this.el.nativeElement.querySelector(`#${id_div}`);
    console.log('onToggle', divElement);

    if (divElement) {
      const computedStyle = window.getComputedStyle(divElement);

      if (computedStyle.display === 'none') {
        // If the div is currently hidden, show it
        this.renderer.setStyle(divElement, 'display', 'block');
      } else {
        // If the div is currently visible, hide it
        this.renderer.setStyle(divElement, 'display', 'none');
      }
    }
  }

  constructor(
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private bankStatementViewerService: BankStatementViewerService,
    private societeService: SocieteService,
    private renderer: Renderer2, // Add this
    private el: ElementRef // Add this
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
    this.subscription.push(
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
    this.subscription.push(
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
    this.subscription.push(
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
    this.subscription.push(
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
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

  selectedSociete: Societe;
  selectedDate: Date = new Date(); // initialise à la date actuelle

  searchExtraitByDate(date: Date): ExtraitBancaire | null {
    const searchDateStr = date.toISOString().slice(0, 10); // format : yyyy-mm-dd

    for (let extrait of this._selectedReleveBancaire!.extraits) {
      const extraitDateStr = extrait.dateExtrait.toISOString().slice(0, 10); // format : yyyy-mm-dd
      if (extraitDateStr === searchDateStr) {
        return extrait;
      }
    }
    return null;
  }

  getCalendarEvents(releve: any, year: number) {
    let events = [
      {
        title: 'Test Event',
        date: '2023-01-01',
        backgroundColor: 'blue',
      },
    ];

    for (let extrait of releve.extraits) {
      let extraitYear = new Date(extrait.dateExtrait).getFullYear();
      if (extraitYear === year) {
        // Ajoute l'événement uniquement si l'année correspond
        let event = {
          title: format(new Date(extrait.dateExtrait), 'yyyy-MM-dd'),
          date: format(new Date(extrait.dateExtrait), 'yyyy-MM-dd'),
          backgroundColor: '#1976d2', // Couleur d'arrière-plan
          borderColor: '#1976d2', // Couleur de la bordure
          textColor: '#ffffff', // Couleur du texte
          totalMouvementsDebit: extrait.totalMouvementsDebit,
          totalMouvementsCredit: extrait.totalMouvementsCredit,
          donneeExtraits: extrait.donneeExtraits,
        };
        events.push(event);
      }
    }

    return events;
  }

  calendarOptions: any = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: [],
    eventColor: 'blue',
    eventBackgroundColor: 'blue',
    eventBorderColor: 'red',
    eventTextColor: 'green',
    eventClick: this.onEventClick.bind(this),
    locale: frLocale, // Ajoutez cette ligne
  };
  displayContent = false;
  selectedExtrait: ExtraitBancaire; // Remplacez 'any' par le type approprié pour vos extraits

  onEventClick(event: any): void {
    console.log('onEventClick');
    console.log('Event Clicked:', event.event);

    const eventTitle = event.event.title;
    if (this.selectedReleveBancaire && this.selectedReleveBancaire.extraits) {
      const matchingExtrait = this.selectedReleveBancaire.extraits.find(
        (extrait) => {
          if (typeof extrait.dateExtrait === 'string') {
            // Convert string date to Date object
            const extraitDate = new Date(extrait.dateExtrait);
            // Format the date to match the event title
            const formattedDate = extraitDate.toISOString().slice(0, 10);

            return formattedDate === eventTitle;
          }
          return false;
        }
      );

      if (matchingExtrait) {
        this.selectedExtrait = matchingExtrait;
        this.displayContent = true;
        setTimeout(() => {
          this.calendarComponent.getApi().render(); // Refresh the calendar events
        }, 0);
      } else {
        console.log('No matching extrait found for event title:', eventTitle);
      }
    } else {
      console.log('No selected releve or extrait available');
    }
  }

  getDistinctExtraitYears(): number[] {
    let distinctYears: number[] = [];

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

  selectedExtraitYear: number = new Date().getFullYear(); // initialise à l'année actuelle

  isYearSelected: boolean = false; // Ajout d'une nouvelle variable

  isSocieteSelected: boolean = false; // Nouvelle variable
  onChange(event: any) {
    this.isYearSelected = false; // Hide the calendar upon selecting a new company

    this.selectedSociete = event.value;
    let foundReleveBancaire;
    for (const releve of this.releves) {
      if (
        (releve.id_societe as any).date ===
          (this.selectedSociete.id as any).date &&
        (releve.id_societe as any).timestamp ===
          (this.selectedSociete.id as any).timestamp
      ) {
        foundReleveBancaire = releve;
        break;
      }
    }
    if (foundReleveBancaire) {
      this.selectedReleveBancaire = foundReleveBancaire;
      let distinctYears = this.getDistinctExtraitYears();
      if (distinctYears.length > 0) {
        // Set selectedExtraitYear to the first year in the list
        this.selectedExtraitYear = distinctYears[0];
        // Then call onExtraitYearChange with the first year in the list
        this.onExtraitYearChange({ value: distinctYears[0] });
      }
      this.isSocieteSelected = true; // Indicates that a company has been selected

      setTimeout(() => this.updateCalendar(), 0);
    } else {
      this.selectedReleveBancaire = undefined;
      this.isSocieteSelected = false; // Indicates that no company has been selected
    }
  }

  ngAfterViewInit(): void {
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.setOption('locale', frLocale);
    }
    this.updateCalendar();
    this.colorerCelluleMois(this.selectedYearExtraitDates);
  }

  updateCalendar(): void {
    if (this.selectedReleveBancaire && !isNaN(this.selectedExtraitYear)) {
      setTimeout(() => {
        this.calendarOptions.events = this.getCalendarEvents(
          this.selectedReleveBancaire,
          this.selectedExtraitYear
        );

        if (this.calendarComponent) {
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.gotoDate(`${this.selectedExtraitYear}-01-01`);
          calendarApi.render();
          this.colorerCelluleMois(this.selectedYearExtraitDates);
        }
      }, 500); // delay in milliseconds
    } else {
      this.calendarOptions.events = [];
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

    // Split date string into day, month, year
    const [day, month, year] = dateString.split(' ');

    // Convert month to number
    const monthNumber = months.indexOf(month.toLowerCase()) + 1;

    // Create a new Date object
    return new Date(Number(year), monthNumber - 1, Number(day));
  }

  selectedYearExtraitDates: string[] = [];
  colorerCelluleMois(dates: string[]): void {
    // 1. Convertir les dates au format de mois et année (yyyy-MM)
    const monthsToColor = dates.map((date) => {
      const [year, month] = this.convertFrenchDate(date)
        .toISOString()
        .slice(0, 7)
        .split('-');
      return `${year}-${month}`;
    });

    // 2. Définir les noms de mois en français pour les utiliser plus tard
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

    // 3. Parcourir tous les mat-card du calendrier
    const calendarMonths = document.querySelectorAll('.month');

    calendarMonths.forEach((monthCard, index) => {
      // 4. Obtenir le mois et l'année de la mat-card
      const cardMonth = frenchMonths[index];
      const cardDate = `${this.selectedExtraitYear}-${('0' + (index + 1)).slice(
        -2
      )}`; // suppose que selectedExtraitYear est l'année sélectionnée

      // 5. Vérifier si le mois de la mat-card doit être coloré
      if (monthsToColor.includes(cardDate)) {
        // 6. Si oui, appliquer un style CSS pour changer la couleur de fond
        monthCard.classList.add('colored-month');
      } else {
        monthCard.classList.remove('colored-month');
      }

      // 7. Ajouter un gestionnaire d'événements de clic à chaque mat-card
      monthCard.addEventListener('click', () => {
        if (monthCard.classList.contains('colored-month')) {
          console.log(`Vous avez cliqué sur un mois coloré: ${cardMonth}`);
        }
      });
    });
  }

  onExtraitYearChange(event: any): void {
    this.selectedExtraitYear = Number(event.value);

    if (!isNaN(this.selectedExtraitYear)) {
      this.isYearSelected = true;

      // Chercher toutes les dates d'extrait pour l'année sélectionnée
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
}
