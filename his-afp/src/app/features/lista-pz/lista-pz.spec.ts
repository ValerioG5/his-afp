import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPz } from './lista-pz';

describe('ListaPz', () => {
  let component: ListaPz;
  let fixture: ComponentFixture<ListaPz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaPz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaPz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
