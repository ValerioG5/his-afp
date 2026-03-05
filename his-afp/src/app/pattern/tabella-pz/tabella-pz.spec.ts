import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabellaPz } from './tabella-pz';

describe('TabellaPz', () => {
  let component: TabellaPz;
  let fixture: ComponentFixture<TabellaPz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabellaPz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabellaPz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
