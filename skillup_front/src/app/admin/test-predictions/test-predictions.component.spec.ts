import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPredictionsComponent } from './test-predictions.component';

describe('TestPredictionsComponent', () => {
  let component: TestPredictionsComponent;
  let fixture: ComponentFixture<TestPredictionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestPredictionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestPredictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
