import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticulationComponent } from './articulation.component';

describe('ArticulationComponent', () => {
  let component: ArticulationComponent;
  let fixture: ComponentFixture<ArticulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticulationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
