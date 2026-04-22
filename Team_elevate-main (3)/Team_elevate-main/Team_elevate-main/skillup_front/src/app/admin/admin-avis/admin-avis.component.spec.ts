import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAvisComponent } from './admin-avis.component';

describe('AdminAvisComponent', () => {
  let component: AdminAvisComponent;
  let fixture: ComponentFixture<AdminAvisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminAvisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAvisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
