import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankStatementTableComponent } from './bank-statement-table.component';

describe('BankStatementTableComponent', () => {
  let component: BankStatementTableComponent;
  let fixture: ComponentFixture<BankStatementTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankStatementTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankStatementTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
