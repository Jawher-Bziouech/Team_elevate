import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionForumComponent } from './gestion-forum.component';

describe('GestionForumComponent', () => {
  let component: GestionForumComponent;
  let fixture: ComponentFixture<GestionForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionForumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
