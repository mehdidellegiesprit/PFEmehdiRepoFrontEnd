import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthExporterFacturesComponent } from './month-exporter-factures.component';

describe('MonthExporterFacturesComponent', () => {
  let component: MonthExporterFacturesComponent;
  let fixture: ComponentFixture<MonthExporterFacturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthExporterFacturesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthExporterFacturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
