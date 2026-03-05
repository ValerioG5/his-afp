import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatoServizi } from './stato-servizi';

describe('StatoServizi', () => {
  let component: StatoServizi;
  let fixture: ComponentFixture<StatoServizi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatoServizi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatoServizi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
