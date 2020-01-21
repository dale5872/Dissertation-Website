import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewuploadsComponent } from './viewuploads.component';

describe('ViewuploadsComponent', () => {
  let component: ViewuploadsComponent;
  let fixture: ComponentFixture<ViewuploadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewuploadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewuploadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
