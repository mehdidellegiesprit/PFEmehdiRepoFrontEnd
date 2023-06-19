import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  TemplateRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DonneeExtrait } from '../model/DonneeExtrait';
import { DatePipe } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalFactureComponent } from '../modal-facture/modal-facture.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-bank-statement-table',
  templateUrl: './bank-statement-table.component.html',
  styleUrls: ['./bank-statement-table.component.css'],
})
export class BankStatementTableComponent implements OnInit, OnChanges {
  dataSource: MatTableDataSource<DonneeExtrait>;
  @Input() data: DonneeExtrait[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  //@Output() toggle: EventEmitter<any> = new EventEmitter<any>();
  @Input() formattedDateExtrait: string;

  displayedColumns: string[] = [
    'dateDonneeExtrait',
    'dateValeurDonneeExtrait',
    'operations',
    'debit',
    'credit',
    'facture',
    'valide',
  ];
  buttons: { collapseId: string }[];
  activeButton: string | null = null;
  isIconUp: boolean = false;
  showFullText: { [key: number]: boolean } = {};
  // modal attributs
  // Déclarez la variable pour la modal
  @ViewChild('modalTemplate') modalTemplate!: TemplateRef<any>;
  dialogRef!: MatDialogRef<ModalFactureComponent>;

  // Fonction pour ouvrir la modal

  openModal(element: DonneeExtrait): void {
    console.log('openModal', element);
    this.dialogRef = this.dialog.open(ModalFactureComponent, {
      // modifié pour utiliser une grande partie de l'écran
      width: '60%',
      disableClose: true,
      panelClass: 'custom-modal', // Ajouter une classe personnalisée
      data: element, // Passer l'élément de données sélectionné à la modal
    });
  }

  constructor(
    private datePipe: DatePipe,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<DonneeExtrait>(this.data);

    // Ajoutez l'icône "expand_less" en ligne
    this.matIconRegistry.addSvgIconLiteral(
      'expand_less',
      this.domSanitizer.bypassSecurityTrustHtml(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M19 13H5v-2h14v2z"/>
      </svg>`
      )
    );
    this.matIconRegistry.addSvgIcon(
      'expand_more',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'chemin_vers_expand_more.svg'
      )
    );
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.buttons = this.generateButtons(); // Generate buttons based on data length
    // Initialize showFullText for each data item to be false
    this.data.forEach((_, index) => (this.showFullText[index] = false));

    // Set activeButton to the id of the first (and only) button
    this.activeButton = this.buttons[0].collapseId;
    this.isIconUp = true;
    this.titleButtonExtrait = 'Click to hide additional details';
    this.setButtonTitle(this.activeButton, this.titleButtonExtrait);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'].currentValue !== changes['data'].previousValue) {
      this.dataSource.data = this.data;
      // Initialize showFullText for each data item to be false
      this.data.forEach((_, index) => (this.showFullText[index] = false));
    }
    console.log('data---', this.data);
  }

  generateButtons(): { collapseId: string }[] {
    const button = {
      collapseId: 'collapse-' + uuidv4(),
    };
    return [button];
  }
  titleButtonExtrait: string | null = 'Click to show additional details';

  toggleVisibility(collapseId: string): void {
    const button = document.getElementById(
      `idbuttonByExtrait${collapseId}`
    ) as HTMLAnchorElement;
    console.log('Show / Hide button:', button);

    if (this.activeButton === collapseId) {
      this.activeButton = null; // Collapse the element if it's already active
      this.titleButtonExtrait = 'Click to show additional details';
    } else {
      this.activeButton = collapseId; // Expand the element if it's not active
      this.titleButtonExtrait = 'Click to hide additional details';
    }

    if (button) {
      button.title = this.titleButtonExtrait;
    }

    //this.toggle.emit(!!this.activeButton);
    this.isIconUp = !this.isIconUp;
  }

  setButtonTitle(collapseId: string, title: string): void {
    const button = document.querySelector(
      `button[aria-controls="${collapseId}"]`
    );
    if (button) {
      button.setAttribute('title', title);
    }
  }

  formatDate(date: any): string {
    if (date) {
      return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
    }
    return '';
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const filterValue = inputElement.value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: DonneeExtrait, filter: string) => {
      const formattedDateDonneeExtrait = this.formatDate(data.dateDonneeExtrait)
        ? this.formatDate(data.dateDonneeExtrait).toLowerCase()
        : '';
      const formattedDateValeurDonneeExtrait = this.formatDate(
        data.dateValeurDonneeExtrait
      )
        ? this.formatDate(data.dateValeurDonneeExtrait).toLowerCase()
        : '';
      const operations = data.operations ? data.operations.toLowerCase() : '';
      const debit =
        data.debit !== null
          ? data.debit.toString().toLowerCase()
          : 'aucun debit';
      const credit =
        data.credit !== null
          ? data.credit.toString().toLowerCase()
          : 'aucun credit';

      return (
        formattedDateDonneeExtrait.includes(filter) ||
        formattedDateValeurDonneeExtrait.includes(filter) ||
        operations.includes(filter) ||
        debit.includes(filter) ||
        credit.includes(filter)
      );
    };
    this.dataSource.filter = filterValue;
  }

  genererEspaces(nombreEspaces: number): string {
    return '&nbsp;'.repeat(nombreEspaces);
  }

  toggleShowFullText(index: number): void {
    this.showFullText[index] = !this.showFullText[index];
  }
}
