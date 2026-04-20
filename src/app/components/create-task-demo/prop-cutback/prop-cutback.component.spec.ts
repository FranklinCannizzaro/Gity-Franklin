import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropCutbackComponent } from './prop-cutback.component';

describe('PropCutbackComponent', () => {
  let component: PropCutbackComponent;
  let fixture: ComponentFixture<PropCutbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropCutbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropCutbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
