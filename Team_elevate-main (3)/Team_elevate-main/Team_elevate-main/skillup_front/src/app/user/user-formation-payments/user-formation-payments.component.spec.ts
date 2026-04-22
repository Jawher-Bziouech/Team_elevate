import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFormationPaymentsComponent } from './user-formation-payments.component';

describe('UserFormationPaymentsComponent', () => {
  let component: UserFormationPaymentsComponent;
  let fixture: ComponentFixture<UserFormationPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserFormationPaymentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFormationPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});