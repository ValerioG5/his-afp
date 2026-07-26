import { TestBed } from '@angular/core/testing';

import { GestionePersonaleService } from './gestione-personale.service';

describe('GestionePersonaleService', () => {
  let service: GestionePersonaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionePersonaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
