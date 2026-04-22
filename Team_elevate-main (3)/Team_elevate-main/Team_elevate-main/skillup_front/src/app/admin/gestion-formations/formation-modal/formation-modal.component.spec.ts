import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationModalComponent } from './formation-modal.component';

describe('FormationModalComponent', () => {
  let component: FormationModalComponent;
  let fixture: ComponentFixture<FormationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
