import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationPaymentComponent } from './formation-payment.component';

describe('FormationPaymentComponent', () => {
  let component: FormationPaymentComponent;
  let fixture: ComponentFixture<FormationPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormationPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});