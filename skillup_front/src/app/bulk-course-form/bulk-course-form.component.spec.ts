import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkCourseFormComponent } from './bulk-course-form.component';

describe('BulkCourseFormComponent', () => {
  let component: BulkCourseFormComponent;
  let fixture: ComponentFixture<BulkCourseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BulkCourseFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkCourseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
