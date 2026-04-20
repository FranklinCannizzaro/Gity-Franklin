import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTaskDemoComponent } from './create-task-demo.component';

describe('CreateTaskDemoComponent', () => {
  let component: CreateTaskDemoComponent;
  let fixture: ComponentFixture<CreateTaskDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTaskDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTaskDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
