import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropVComponent } from './prop-v.component';

describe('PropVComponent', () => {
  let component: PropVComponent;
  let fixture: ComponentFixture<PropVComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropVComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
