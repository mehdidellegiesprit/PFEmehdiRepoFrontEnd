import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild,
  Input,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../service/notification.service';
import { BankStatementViewerService } from '../service/bank-statement-viewer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';
import { ReleveBancaire } from '../model/ReleveBancaire';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DonneeExtrait } from '../model/DonneeExtrait';

@Component({
  selector: 'app-bank-statement-table-display',
  templateUrl: './bank-statement-table-display.component.html',
  styleUrls: ['./bank-statement-table-display.component.css'],
})
export class BankStatementTableDisplayComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  accordionDataSources: MatTableDataSource<DonneeExtrait>[] = [];
  @Input() releves: ReleveBancaire[] = [];
  dataSource: MatTableDataSource<DonneeExtrait>;
  currentPageData: DonneeExtrait[] = [];
  currentPageIndex = 0;
  pageSize = 5;
  totalItemsCount = 0;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  private subscription: Subscription[] = [];

  displayedColumns: string[] = [
    'dateDonneeExtrait',
    'dateValeurDonneeExtrait',
    'operations',
    'debit',
    'credit',
  ];

  constructor(
    private notificationService: NotificationService,
    private bankStatementViewerService: BankStatementViewerService
  ) {
    this.dataSource = new MatTableDataSource<DonneeExtrait>([]);
  }

  ngAfterViewInit() {
    this.getReleveBancaire();
  }

  onPageChange(event: PageEvent): void {
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.currentPageData = this.dataSource.data.slice(startIndex, endIndex);
  }

  Filterchange(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.applyFilter(filterValue);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.currentPageData = this.dataSource.data.filter((item) => {
      for (const key in item) {
        if (
          item[key as keyof DonneeExtrait]
            .toString()
            .toLowerCase()
            .includes(filterValue)
        ) {
          return true;
        }
      }
      return false;
    });
    this.totalItemsCount = this.currentPageData.length;
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

  public getReleveBancaire(): void {
    this.subscription.push(
      this.bankStatementViewerService.getAllRelevesBancaires().subscribe(
        (response: ReleveBancaire[]) => {
          this.releves = response;
          this.accordionDataSources = [];

          for (const releve of response) {
            const donneeExtraits: DonneeExtrait[] = [];

            for (const extrait of releve.extraits) {
              for (const donneeExtrait of extrait.donneeExtraits) {
                donneeExtraits.push(donneeExtrait);
              }
            }

            const accordionDataSource = new MatTableDataSource<DonneeExtrait>(
              donneeExtraits
            );
            accordionDataSource.paginator = this.paginator;
            accordionDataSource.sort = this.sort;
            this.accordionDataSources.push(accordionDataSource);
          }

          if (this.accordionDataSources.length > 0) {
            this.dataSource = this.accordionDataSources[0];
            this.currentPageData = this.dataSource.data.slice(0, this.pageSize);
            this.totalItemsCount = this.dataSource.filteredData.length;
          }

          this.currentPageIndex = 0;
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

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}
