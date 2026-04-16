import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyCertificatComponent } from './verify-certificat.component';

describe('VerifyCertificatComponent', () => {
  let component: VerifyCertificatComponent;
  let fixture: ComponentFixture<VerifyCertificatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerifyCertificatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyCertificatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
