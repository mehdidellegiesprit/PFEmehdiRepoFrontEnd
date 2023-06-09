import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-bank-statement-table-display',
  templateUrl: './bank-statement-table-display.component.html',
  styleUrls: ['./bank-statement-table-display.component.css'],
})
export class BankStatementTableDisplayComponent implements OnInit, OnDestroy {
  releves: ReleveBancaire[] = [];
  societes: Societe[] = [];
  private subscription: Subscription[] = [];
  isVisible = false; // Initialize as hidden

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
    this.getAllSocietes();
    this.getAllRelevesBancaires();
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
  selectedSociete: Societe; // Ajoutez cette ligne pour déclarer la propriété
  selectedReleveBancaire?: ReleveBancaire;
  selectedDate: Date = new Date(); // initialise à la date actuelle
  onChange(event: any) {
    // console.log('Societes:', this.societes);
    // console.log('Releves:', this.releves);

    this.selectedSociete = event.value;
    // if (this.selectedSociete) {
    //   console.log('Id de Société sélectionnée :', this.selectedSociete.id);
    // }

    let foundReleveBancaire;
    for (const releve of this.releves) {
      // console.log('releve.id_societe :', releve.id_societe);
      // console.log('Id de Société sélectionnée :', this.selectedSociete.id);
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
    // console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkk');

    if (foundReleveBancaire) {
      this.selectedReleveBancaire = foundReleveBancaire;
    } else {
      //console.warn('Aucun ReleveBancaire trouvé pour cette société.');
      this.selectedReleveBancaire = undefined;
    }

    // console.log(
    //   'Liste des ids de sociétés dans les relevés :',
    //   this.releves.map((releve) => releve.id_societe)
    // );
  }

  // Voici comment vous pouvez créer la méthode de recherche
  searchExtraitByDate(date: Date): ExtraitBancaire | null {
    // Nous convertissons la date de recherche en string pour faciliter la comparaison
    const searchDateStr = date.toISOString().slice(0, 10); // format : yyyy-mm-dd

    for (let extrait of this.selectedReleveBancaire!.extraits) {
      // Nous convertissons aussi la date de l'extrait en string pour la comparaison
      const extraitDateStr = extrait.dateExtrait.toISOString().slice(0, 10); // format : yyyy-mm-dd
      if (extraitDateStr === searchDateStr) {
        return extrait;
      }
    }
    // Si aucun extrait n'est trouvé, on retourne null
    return null;
  }
}
