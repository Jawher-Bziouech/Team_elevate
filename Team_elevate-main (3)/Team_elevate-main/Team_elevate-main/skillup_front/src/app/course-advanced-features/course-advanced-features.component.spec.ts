import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseAdvancedFeaturesComponent } from './course-advanced-features.component';

describe('CourseAdvancedFeaturesComponent', () => {
  let component: CourseAdvancedFeaturesComponent;
  let fixture: ComponentFixture<CourseAdvancedFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CourseAdvancedFeaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseAdvancedFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
