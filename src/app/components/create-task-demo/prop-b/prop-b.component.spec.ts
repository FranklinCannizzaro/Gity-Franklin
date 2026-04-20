import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropBComponent } from './prop-b.component';

describe('PropBComponent', () => {
  let component: PropBComponent;
  let fixture: ComponentFixture<PropBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropBComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
