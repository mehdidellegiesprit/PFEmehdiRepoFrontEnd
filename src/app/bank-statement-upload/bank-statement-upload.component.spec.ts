import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankStatementUploadComponent } from './bank-statement-upload.component';

describe('BankStatementUploadComponent', () => {
  let component: BankStatementUploadComponent;
  let fixture: ComponentFixture<BankStatementUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankStatementUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankStatementUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
