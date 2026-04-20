import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropCollarsComponent } from './prop-collars.component';

describe('PropCollarsComponent', () => {
  let component: PropCollarsComponent;
  let fixture: ComponentFixture<PropCollarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropCollarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropCollarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
