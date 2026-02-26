import { TestBed } from '@angular/core/testing';

import { PatientManager } from './patient-manager';

describe('PatientManager', () => {
  let service: PatientManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
