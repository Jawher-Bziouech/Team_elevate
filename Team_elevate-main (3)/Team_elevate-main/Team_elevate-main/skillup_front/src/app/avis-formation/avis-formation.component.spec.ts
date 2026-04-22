import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvisFormationComponent } from './avis-formation.component';

describe('AvisFormationComponent', () => {
  let component: AvisFormationComponent;
  let fixture: ComponentFixture<AvisFormationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvisFormationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvisFormationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
