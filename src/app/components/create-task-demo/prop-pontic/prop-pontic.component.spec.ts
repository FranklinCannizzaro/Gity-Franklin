import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropPonticComponent } from './prop-pontic.component';

describe('PropPonticComponent', () => {
  let component: PropPonticComponent;
  let fixture: ComponentFixture<PropPonticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropPonticComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropPonticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
