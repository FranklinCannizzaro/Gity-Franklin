import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropHComponent } from './prop-h.component';

describe('PropHComponent', () => {
  let component: PropHComponent;
  let fixture: ComponentFixture<PropHComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropHComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropHComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
