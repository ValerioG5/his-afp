import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificaPz } from './modifica-pz';

describe('ModificaPz', () => {
  let component: ModificaPz;
  let fixture: ComponentFixture<ModificaPz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificaPz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificaPz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
