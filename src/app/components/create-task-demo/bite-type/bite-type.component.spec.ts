import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiteTypeComponent } from './bite-type.component';

describe('BiteTypeComponent', () => {
  let component: BiteTypeComponent;
  let fixture: ComponentFixture<BiteTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiteTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiteTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
