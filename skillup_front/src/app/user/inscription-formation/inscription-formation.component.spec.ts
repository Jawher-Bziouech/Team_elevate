import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionFormationComponent } from './inscription-formation.component';

describe('InscriptionFormationComponent', () => {
  let component: InscriptionFormationComponent;
  let fixture: ComponentFixture<InscriptionFormationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InscriptionFormationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionFormationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
