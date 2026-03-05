import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccettazionePz } from './accettazione-pz';

describe('AccettazionePz', () => {
  let component: AccettazionePz;
  let fixture: ComponentFixture<AccettazionePz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccettazionePz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccettazionePz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
