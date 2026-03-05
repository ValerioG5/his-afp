import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DarkmodeSelector } from './darkmode-selector.component';

describe('DarckmodeSelector', () => {
  let component: DarkmodeSelector;
  let fixture: ComponentFixture<DarkmodeSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DarkmodeSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(DarkmodeSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
