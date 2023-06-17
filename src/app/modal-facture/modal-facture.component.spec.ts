import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFactureComponent } from './modal-facture.component';

describe('ModalFactureComponent', () => {
  let component: ModalFactureComponent;
  let fixture: ComponentFixture<ModalFactureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalFactureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
