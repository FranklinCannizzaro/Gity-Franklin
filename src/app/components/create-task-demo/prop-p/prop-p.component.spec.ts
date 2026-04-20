import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropPComponent } from './prop-p.component';

describe('PropPComponent', () => {
  let component: PropPComponent;
  let fixture: ComponentFixture<PropPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropPComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
