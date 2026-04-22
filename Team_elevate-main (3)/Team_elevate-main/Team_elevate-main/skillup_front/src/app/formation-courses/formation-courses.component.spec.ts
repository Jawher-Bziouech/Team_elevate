import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationCoursesComponent } from './formation-courses.component';

describe('FormationCoursesComponent', () => {
  let component: FormationCoursesComponent;
  let fixture: ComponentFixture<FormationCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormationCoursesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
