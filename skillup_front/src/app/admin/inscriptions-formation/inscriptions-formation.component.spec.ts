import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionsFormationComponent } from './inscriptions-formation.component';

describe('InscriptionsFormationComponent', () => {
  let component: InscriptionsFormationComponent;
  let fixture: ComponentFixture<InscriptionsFormationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InscriptionsFormationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionsFormationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
