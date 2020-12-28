import { TestBed } from '@angular/core/testing';

import { WorkerGuard } from './worker.guard';
import {Router} from '@angular/router';
import createSpyObj = jasmine.createSpyObj;
import {Address} from '../models/address';
import {AddressService} from '../services/address.service';

describe('WorkerGuard', () => {
  let guard: WorkerGuard;
  let routerSpy: any;
  let addressServiceSpy: any;

  beforeEach(() => {
    routerSpy = createSpyObj(['navigate']);
    addressServiceSpy = createSpyObj(['isLoadedLibs']);

    TestBed.configureTestingModule({
      providers: [
        {provide: Router, useValue: routerSpy},
        {provide: AddressService, useValue: addressServiceSpy},
      ]
    });
    guard = TestBed.inject(WorkerGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when data is loaded', () => {
      // arrange
      addressServiceSpy.isLoadedLibs.and.returnValue(true);

      // act
      const result = guard.canActivate(null as any, null as any);

      // assert
      expect(result).toBe(true);
    });

    it('should return false and call navigation to load when data is not loaded', () => {
      // arrange
      const expectedNavigation = ['/load', {}];
      addressServiceSpy.isLoadedLibs.and.returnValue(false);

      // act
      const result = guard.canActivate(null as any, null as any);

      // assert
      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(expectedNavigation);
    });
  });
});
