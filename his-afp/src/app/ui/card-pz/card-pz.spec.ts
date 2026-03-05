import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPz } from './card-pz';

describe('CardPz', () => {
  let component: CardPz;
  let fixture: ComponentFixture<CardPz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
