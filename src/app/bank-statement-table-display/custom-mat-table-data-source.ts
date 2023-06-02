import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

export class CustomMatTableDataSource<T> extends MatTableDataSource<T> {
  totalItemsCount: number | undefined;
    filteredData: any;

  constructor(private paginator: MatPaginator, private sort: MatSort) {
    super();
  }

  connect(): BehaviorSubject<T[]> {
    const data = this.sortData([...this.filteredData]);
    this.totalItemsCount = data.length;
    this.paginator.length = this.totalItemsCount;
    return super.connect();
  }
    sortData(arg0: any[]) {
        throw new Error('Method not implemented.');
    }

  disconnect() {
    super.disconnect();
  }
}
