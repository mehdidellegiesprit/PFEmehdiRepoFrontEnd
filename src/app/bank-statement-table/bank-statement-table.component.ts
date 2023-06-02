import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DonneeExtrait } from '../model/DonneeExtrait';

@Component({
  selector: 'app-bank-statement-table',
  templateUrl: './bank-statement-table.component.html',
  styleUrls: ['./bank-statement-table.component.css'],
})
export class BankStatementTableComponent implements OnInit, OnChanges {
  @Input() data: DonneeExtrait[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'dateDonneeExtrait',
    'dateValeurDonneeExtrait',
    'operations',
    'debit',
    'credit',
  ];
  dataSource: MatTableDataSource<DonneeExtrait>;

  constructor() {
    this.dataSource = new MatTableDataSource<DonneeExtrait>(this.data);
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
