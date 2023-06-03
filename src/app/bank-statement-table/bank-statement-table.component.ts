import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DonneeExtrait } from '../model/DonneeExtrait';
import { DatePipe } from '@angular/common';

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
  @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>();

  displayedColumns: string[] = [
    'dateDonneeExtrait',
    'dateValeurDonneeExtrait',
    'operations',
    'debit',
    'credit',
  ];
  buttons: { collapseId: string }[];
  activeButton: string | null = null;

  generateButtons(): { collapseId: string }[] {
    const button = {
      collapseId: 'collapse-' + Math.random().toString(36).substring(7),
    };
    return [button];
  }

  toggleVisibility(collapseId: string): void {
    if (this.activeButton === collapseId) {
      this.activeButton = null; // Collapse the element if it's already active
    } else {
      this.activeButton = collapseId; // Expand the element if it's not active
    }
  }

  formatDate(date: any): string {
    if (date) {
      return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
    }
    return '';
  }
  constructor(private datePipe: DatePipe) {
    this.dataSource = new MatTableDataSource<DonneeExtrait>(this.data);
  }
  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.buttons = this.generateButtons(); // Generate buttons based on data length
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'].currentValue !== changes['data'].previousValue) {
      this.dataSource.data = this.data;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
