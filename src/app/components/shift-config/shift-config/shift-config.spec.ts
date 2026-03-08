import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftConfigComponent } from './shift-config';

describe('ShiftConfigComponent', () => {
  let component: ShiftConfigComponent;
  let fixture: ComponentFixture<ShiftConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftConfigComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShiftConfigComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
