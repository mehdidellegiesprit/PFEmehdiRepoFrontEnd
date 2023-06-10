import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
    this.calendarOptions.events = this.getCalendarEvents(value);
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
          console.log('*****societes:', this.societes);
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
          console.log('**releves:', this.releves);

          const calendarApi = this.calendarComponent.getApi();
          calendarApi.setOption('locale', frLocale as LocaleInput);

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

  onChange(event: any) {
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
        this.onExtraitYearChange({ target: { value: distinctYears[0] } });
      }
    } else {
      this.selectedReleveBancaire = undefined;
    }
  }

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

  getCalendarEvents(releve: any) {
    console.log('getCalendarEvents triggered with releve: ', releve);

    // let events = [];
    let events = [
      {
        title: 'Test Event',
        date: '2023-01-01',
        backgroundColor: 'red',
      },
    ];

    for (let extrait of releve.extraits) {
      console.log('extrait object: ', extrait);
      let event = {
        title:
          'ExtraitBancaire - ' +
          format(new Date(extrait.dateExtrait), 'yyyy-MM-dd'),
        date: format(
          new Date(extrait.dateDuSoldeCrediteurDebutMois),
          'yyyy-MM-dd'
        ),
        backgroundColor: 'red',
        // Ajout d'informations supplémentaires
        totalMouvementsDebit: extrait.totalMouvementsDebit,
        totalMouvementsCredit: extrait.totalMouvementsCredit,
        donneeExtraits: extrait.donneeExtraits,
      };

      events.push(event);
    }

    console.log('Events generated: ', events);
    return events;
  }

  calendarOptions: any = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: [],
    eventColor: '#0000ff', // bleu
    eventBackgroundColor: '#0000ff', // bleu
    eventBorderColor: '#ff0000', // rouge
    eventTextColor: '#00ff00', // vert
  };

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

  onExtraitYearChange(event: any): void {
    this.selectedExtraitYear = Number(event.target.value);
    this.calendarOptions.events = this.getCalendarEvents(
      this.selectedReleveBancaire
    );
    this.calendarOptions.initialView = 'dayGridMonth';
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(`${this.selectedExtraitYear}-01-01`); // use fullcalendar's gotoDate method
    calendarApi.render(); // Here we force the calendar to re-render
  }
  getDayCellSize(): string {
    // Calcul de la taille des carreaux en fonction de la logique souhaitée
    // Par exemple, vous pouvez utiliser la taille de l'écran ou une autre mesure
    const screenSize = window.innerWidth;

    if (screenSize < 768) {
      // Petite taille d'écran, utiliser une taille plus petite pour les carreaux
      return '20px';
    } else {
      // Grande taille d'écran, utiliser une taille plus grande pour les carreaux
      return '30px';
    }
  }
}
