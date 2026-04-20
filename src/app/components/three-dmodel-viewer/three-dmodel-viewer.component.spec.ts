import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeDModelViewerComponent } from './three-dmodel-viewer.component';

describe('ThreeDModelViewerComponent', () => {
  let component: ThreeDModelViewerComponent;
  let fixture: ComponentFixture<ThreeDModelViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeDModelViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeDModelViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
