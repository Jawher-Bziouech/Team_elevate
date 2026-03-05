import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeSimpleComponent } from './badge-simple.component';

describe('BadgeSimpleComponent', () => {
  let component: BadgeSimpleComponent;
  let fixture: ComponentFixture<BadgeSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BadgeSimpleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BadgeSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
