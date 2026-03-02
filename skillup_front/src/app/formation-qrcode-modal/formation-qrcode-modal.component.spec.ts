import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationQrcodeModalComponent } from './formation-qrcode-modal.component';

describe('FormationQrcodeModalComponent', () => {
  let component: FormationQrcodeModalComponent;
  let fixture: ComponentFixture<FormationQrcodeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormationQrcodeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationQrcodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
