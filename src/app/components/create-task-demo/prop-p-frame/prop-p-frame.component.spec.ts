import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropPFrameComponent } from './prop-p-frame.component';

describe('PropPFrameComponent', () => {
  let component: PropPFrameComponent;
  let fixture: ComponentFixture<PropPFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropPFrameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropPFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
