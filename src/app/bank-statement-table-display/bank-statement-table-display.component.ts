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
  updateCalendar(): void {
    if (this.selectedReleveBancaire && !isNaN(this.selectedExtraitYear)) {
      this.calendarOptions.events = this.getCalendarEvents(
        this.selectedReleveBancaire,
        this.selectedExtraitYear
      );

      if (this.calendarComponent) {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.gotoDate(`${this.selectedExtraitYear}-01-01`);
        calendarApi.render();
      }
    } else {
      this.calendarOptions.events = [];
    }
  }

  onToggle(id_div: string): void {
    const divElement = document.getElementById(id_div);
    console.log('onToggle', divElement);

    if (divElement) {
      const computedStyle = window.getComputedStyle(divElement);

      if (computedStyle.display === 'none') {
        // If the div is currently hidden, show it
        divElement.style.display = 'block';
      } else {
        // If the div is currently visible, hide it
        divElement.style.display = 'none';
      }
    }
  }

  constructor(
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private bankStatementViewerService: BankStatementViewerService,
    private societeService: SocieteService
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
  };

  onEventClick(event: any): void {
    console.log('Événement cliqué :', event.event);
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
  }

  onExtraitYearChange(event: any): void {
    this.selectedExtraitYear = Number(event.value); // Changer ici

    if (!isNaN(this.selectedExtraitYear)) {
      this.isYearSelected = true;
    } else {
      this.isYearSelected = false;
    }

    this.updateCalendar();
  }

  onExtraitDateChange(event: any): void {
    this.selectedDate = new Date(event.value);
  }
}
