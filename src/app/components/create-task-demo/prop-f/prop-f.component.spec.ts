import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropFComponent } from './prop-f.component';

describe('PropFComponent', () => {
  let component: PropFComponent;
  let fixture: ComponentFixture<PropFComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropFComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
