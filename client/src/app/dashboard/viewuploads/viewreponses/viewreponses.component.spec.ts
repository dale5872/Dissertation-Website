import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewreponsesComponent } from './viewreponses.component';

describe('ViewreponsesComponent', () => {
  let component: ViewreponsesComponent;
  let fixture: ComponentFixture<ViewreponsesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewreponsesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewreponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
