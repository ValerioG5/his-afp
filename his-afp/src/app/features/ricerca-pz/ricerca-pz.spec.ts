import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaPaziente } from './ricerca-pz';

describe('RicercaPaziente', () => {
  let component: RicercaPaziente;
  let fixture: ComponentFixture<RicercaPaziente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RicercaPaziente],
    }).compileComponents();

    fixture = TestBed.createComponent(RicercaPaziente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
