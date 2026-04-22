import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCertificatComponent } from './gestion-certificat.component';

describe('GestionCertificatComponent', () => {
  let component: GestionCertificatComponent;
  let fixture: ComponentFixture<GestionCertificatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionCertificatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionCertificatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
