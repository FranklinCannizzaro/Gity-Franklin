import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropAComponent } from './prop-a.component';

describe('PropAComponent', () => {
  let component: PropAComponent;
  let fixture: ComponentFixture<PropAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
