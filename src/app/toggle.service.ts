import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToggleService {
  // Observable string source
  private componentVisibilitySource = new BehaviorSubject<boolean>(false);

  // Observable string stream
  componentVisibility$ = this.componentVisibilitySource.asObservable();

  // Service command
  changeVisibility(isVisible: boolean) {
    this.componentVisibilitySource.next(isVisible);
  }
  getCurrentVisibility(): boolean {
    return this.componentVisibilitySource.getValue();
  }
}
