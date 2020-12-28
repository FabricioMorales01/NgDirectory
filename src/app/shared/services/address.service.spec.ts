import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';

import { AddressService } from './address.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {WorkerStatus} from '../enums/worker-status';
import {WorkerHandler} from '../worker/worker-handler';
import {Subject} from 'rxjs';
import {WorkerScripts} from '../worker/worker-scripts';
import {QueryOptions} from '../models/query-options';
import {Address} from '../models/address';

describe('AddressService', () => {

  beforeEach(() => {
    const workerHandlerSpy = jasmine.createSpyObj('WorkerHandler', ['executeScript']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        AddressService,
        { provide: WorkerHandler, useValue: workerHandlerSpy }
      ]
    });
  });

  it('should be created', inject ([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
  }));

  describe('isLoadedLibs', () => {
    it('should return true if libs are loaded', inject ([AddressService], (service: AddressService) => {
      // arrange
      (AddressService as any).workerStatus = WorkerStatus.loadedLibs;

      // act
      const result = service.isLoadedLibs();

      // assert
      expect(result).toEqual(true);
    }));

    it('should return false if libs are not loaded', inject ([AddressService], (service: AddressService) => {
      // arrange
      (AddressService as any).workerStatus = WorkerStatus.loadingLibs;

      // act
      const result = service.isLoadedLibs();

      // assert
      expect(result).toEqual(false);
    }));


    it('should return false and call script if status initial', inject ([AddressService], (service: AddressService) => {
      // arrange
      (AddressService as any).workerStatus = WorkerStatus.initial;
      const loadLibsSpy = spyOn(service, 'loadLibs');

      // act
      const result = service.isLoadedLibs();

      // assert
      expect(result).toEqual(false);
      expect(loadLibsSpy).toHaveBeenCalled();
    }));
  });

  describe('loadLibs', () => {
    it('should call to execute script function and change status to loadedLibs',
      inject ([AddressService, WorkerHandler], async (service: AddressService, workerHandler: WorkerHandler) => {

      // arrange
      (AddressService as any).workerStatus = WorkerStatus.initial;
      const executeSpy = createExecuteSpy(workerHandler);
      const expectedScript  = WorkerScripts.GetLoadDependenciesScript();

      // act
      const result = service.loadLibs();
      executeSpy.next();
      executeSpy.complete();
      await  result.toPromise();

      // assert
      expect((AddressService as any).workerStatus).toEqual(WorkerStatus.loadedLibs);
      expect(workerHandler.executeScript).toHaveBeenCalledWith(expectedScript);
    }));

    it('should keep current status when error is returned',
      inject ([AddressService, WorkerHandler], async (service: AddressService, workerHandler: WorkerHandler) => {

        // arrange
        (AddressService as any).workerStatus = WorkerStatus.initial;
        const executeSpy = createExecuteSpy(workerHandler);

        // act
        const result = service.loadLibs();
        executeSpy.next({error: 'Rest error'});
        executeSpy.complete();
        await  result.toPromise();

        // assert
        expect((AddressService as any).workerStatus).toEqual(WorkerStatus.initial);
      }));
  });

  describe('loadData', () => {
    it('should call to execute script function and change status to loadedData',
      inject ([AddressService, WorkerHandler], async (service: AddressService, workerHandler: WorkerHandler) => {

        // arrange
        (AddressService as any).workerStatus = WorkerStatus.initial;
        const executeSpy = createExecuteSpy(workerHandler);
        const expectedScript  = WorkerScripts.GetLoadDataScript('https://0f1c6e64.s3.amazonaws.com/addresses.txt');

        // act
        const result = service.loadData();
        executeSpy.next();
        executeSpy.complete();
        await  result.toPromise();

        // assert
        expect((AddressService as any).workerStatus).toEqual(WorkerStatus.loadedData);
        expect(workerHandler.executeScript).toHaveBeenCalledWith(expectedScript);
      }));
  });

  describe('executeQuery', () => {
    it('should call to execute script function and return data',
      inject ([AddressService, WorkerHandler], (service: AddressService, workerHandler: WorkerHandler) => {

        // arrange
        const executeSpy = createExecuteSpy(workerHandler);
        const options: QueryOptions = { filters: {}, sortField: undefined, sortAsc: undefined, pagSize: undefined, pagNumber: undefined };
        const expectedScript  = WorkerScripts.GetCustomQueryScript({query: '', ...options});
        const expectedData = new Object('Test data');

        // act
        let resultData = {};
        const result = service.executeQuery(options);
        result.subscribe(res => {
          resultData = res;
        });
        executeSpy.next(expectedData);
        executeSpy.complete();

        // assert
        expect(resultData).toBe(expectedData);
        expect(workerHandler.executeScript).toHaveBeenCalledWith(expectedScript);
      }));

    it('should generate a query script for python using filter param',
      inject ([AddressService, WorkerHandler], (service: AddressService, workerHandler: any) => {

        // arrange
        let sentQuery = '';
        const executeSpy = workerHandler.executeScript.and.callFake((optionsQuery: any) => {
          sentQuery = optionsQuery.query;
        });
        const options: QueryOptions = { filters: {
            key1: { value: 'value1', matchMode: 'contains'},
            key2: { value: 'value2', matchMode: 'startswith'},
          }};
        let expectedQuery = '(result[\'key1\'].str.lower().str.contains(\'value1\')) & (result[\'key2\'].str.lower().str.startswith(\'value2\'))';
        expectedQuery = `result = result.loc[(${expectedQuery})]`;

        // act
        service.executeQuery(options);
        // assert
        expect(sentQuery).toEqual(expectedQuery);
      }));
  });

  describe('updateAddress', () => {
    it('should call to execute script function and return data',
      inject ([AddressService, WorkerHandler], (service: AddressService, workerHandler: WorkerHandler) => {

        // arrange
        const executeSpy = createExecuteSpy(workerHandler);
        const address: Address = getAddresses(1)[0];
        const expectedScript  = WorkerScripts.GetUpdateScript(address);
        const expectedData = new Object('Test data');

        // act
        let resultData = {};
        const result = service.updateAddress(address);
        result.subscribe(res => {
          resultData = res;
        });
        executeSpy.next(expectedData);
        executeSpy.complete();

        // assert
        expect(resultData).toBe(expectedData);
        expect(workerHandler.executeScript).toHaveBeenCalledWith(expectedScript);
      }));
  });

  describe('updateAddressToServer', () => {
    let httpTestingController: HttpTestingController;

    beforeEach(inject([HttpTestingController], (httpTestingCtrl: HttpTestingController) => {
      httpTestingController = httpTestingCtrl;
    }));

    it('should send a post request to api',
      inject ([AddressService], (service: AddressService) => {

        // arrange
        const address = getAddresses(1)[0];
        const expectedResponse: any = { isSuccessful: true };


        // act
        const observable = service.updateAddressToServer(address);

        // assert
        observable.subscribe(
          res => expect(res).toBe(expectedResponse, 'should return expected response')
        );
        const req = httpTestingController.expectOne('/api/addresses');
        expect(req.request.method).toEqual('POST');
        req.flush(expectedResponse);
      }));

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

  });
});

function createExecuteSpy(workerHandler: any): Subject<any> {
  const subject = new Subject();
  workerHandler.executeScript.and.returnValue(subject);
  return subject;
}

function getAddresses(n: number): Address[] {
  const result: Address[] = [];

  for (let i = 0; i < n; i++) {
    result.push({
      Id: i,
      City: `city${i}`,
      State: `state${i}`,
      Street: `street${i}`,
      StreetNumber: `streetnumbr${i}`,
      Zip: `zip${i}`
    });
  }

  return result;
}
