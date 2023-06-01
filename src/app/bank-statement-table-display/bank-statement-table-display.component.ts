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
import { MatPaginator } from '@angular/material/paginator';
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

  displayedColumns: string[] = [
    'dateDonneeExtrait',
    'dateValeurDonneeExtrait',
    'operations',
    'debit',
    'credit',
  ];
  dataSource: MatTableDataSource<DonneeExtrait> =
    new MatTableDataSource<DonneeExtrait>([]);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  private subscription: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private bankStatementViewerService: BankStatementViewerService
  ) {}

  ngAfterViewInit() {
    this.getReleveBancaire();
  }

  Filterchange(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
            this.accordionDataSources.push(accordionDataSource);
          }

          if (this.accordionDataSources.length > 0) {
            this.dataSource = this.accordionDataSources[0];
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
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
    this.getReleveBancaire();
  }

  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}
