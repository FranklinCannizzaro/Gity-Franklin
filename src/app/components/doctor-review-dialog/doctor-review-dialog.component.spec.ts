import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorReviewDialogComponent } from './doctor-review-dialog.component';

describe('DoctorReviewDialogComponent', () => {
  let component: DoctorReviewDialogComponent;
  let fixture: ComponentFixture<DoctorReviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorReviewDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorReviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
