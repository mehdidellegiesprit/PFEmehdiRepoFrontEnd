import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthSelectorDialogComponent } from './month-selector-dialog.component';

describe('MonthSelectorDialogComponent', () => {
  let component: MonthSelectorDialogComponent;
  let fixture: ComponentFixture<MonthSelectorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthSelectorDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthSelectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
