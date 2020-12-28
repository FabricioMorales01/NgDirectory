import {ComponentFixture, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';

import { AddressGridComponent } from './address-grid.component';
import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;
import {AddressService} from '../../shared/services/address.service';
import {WorkerStatus} from '../../shared/enums/worker-status';
import {LazyLoadEvent, MessageService} from 'primeng/api';
import {Subject} from 'rxjs';
import {Address} from '../../shared/models/address';
import {TableModule} from 'primeng/table';

describe('AddressGridComponent', () => {
  let component: AddressGridComponent;
  let fixture: ComponentFixture<AddressGridComponent>;
  let compiled: any;
  let addressServiceSpy: any;
  let messageServiceSpy: any;
  let subjectData: Subject<any>;

  beforeEach(async () => {
    messageServiceSpy = createSpyObj(['add']);
    addressServiceSpy = createSpyObj('AddressService',
      ['loadData', 'updateQuery', 'executeQuery', 'updateAddressToServer', 'updateAddress']);
    subjectData = new Subject();
    addressServiceSpy.loadData.and.returnValue(subjectData);
    subjectData.complete();

    await TestBed.configureTestingModule({
      imports: [TableModule],
      declarations: [ AddressGridComponent ],
      providers: [
        {provide: AddressService, useValue: addressServiceSpy},
        {provide: MessageService, useValue: messageServiceSpy},
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    compiled = fixture.debugElement.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load table with returned data',
      fakeAsync(async () => {
        // arrange
        const pageSize = 10;
        const totalRecords = 1000;
        const expectedPageLabel = 'Showing 1 to 10 of 1000 entries';
        const expectedResponse = {
          result: getAddresses(pageSize),
          total: totalRecords
        };
        const subject = new Subject();
        addressServiceSpy.loadData.and.returnValue(subject);

        // act
        const result = component.ngOnInit();
        subject.next(expectedResponse);
        subject.complete();
        fixture.detectChanges();
        tick(100);

        // assert
        const pageLabel = compiled.querySelector('.p-paginator-current').textContent;
        const rowNumber = compiled.querySelectorAll('.p-datatable-tbody tr').length;
        expect(addressServiceSpy.loadData).toHaveBeenCalled();
        expect(rowNumber).toEqual(pageSize);
        expect(pageLabel).toEqual(expectedPageLabel);
      }));
  });

  describe('loadData', () => {
    it('should modify queryOptions and execute updateDataUsingQuery when data is loaded', () => {
      // arrange
      spyOn(component as any, 'updateDataUsingQuery');
      (component as any).isDataLoaded =  true;
      const event: LazyLoadEvent = {
        filters: {},
        first: 20,
        rows: 10,
        sortField: 'testField',
        sortOrder: 1
      };
      const expectedPagNumber = 2;
      const expectedSortAsc = true;

      // act
      const result = component.loadData(event);

      // assert
      expect(component.queryOptions.filters).toEqual(event.filters);
      expect(component.queryOptions.pagNumber).toEqual(expectedPagNumber);
      expect(component.queryOptions.pagSize).toEqual(event.rows);
      expect(component.queryOptions.sortField).toEqual(event.sortField);
      expect(component.queryOptions.sortAsc).toEqual(expectedSortAsc);
      expect(component.updateDataUsingQuery).toHaveBeenCalled();
    });

    it('should keep queryOptions in current status and updateDataUsingQuery is not executed when data is not loaded', () => {
      // arrange
      spyOn(component as any, 'updateDataUsingQuery');
      (component as any).isDataLoaded =  false;
      const expectedSortField = 'currentField';
      const event: LazyLoadEvent = {
        filters: {},
        first: 20,
        rows: 10,
        sortField: 'newField',
        sortOrder: 1
      };
      component.queryOptions.sortField = 'currentField';


      // act
      const result = component.loadData(event);

      // assert
      expect(component.queryOptions.sortField).toEqual(expectedSortField);
      expect(component.updateDataUsingQuery).not.toHaveBeenCalled();
    });
  });

  describe('updateDataUsingQuery', () => {
    it('should call to executeQuery and set data', () => {
        // arrange
        const expectedResult = new Object('Test result');
        const expectedTotal = new Object('Test total');
        const subject = new Subject();
        addressServiceSpy.executeQuery.and.returnValue(subject);
        spyOn(component as any, 'setData');

        // act
        const result = component.updateDataUsingQuery();
        subject.next({result: expectedResult, total: expectedTotal});
        subject.complete();

        // assert
        expect(addressServiceSpy.executeQuery).toHaveBeenCalled();
        expect((component as any).setData).toHaveBeenCalledWith(expectedResult, expectedTotal);
      });
  });

  describe('onRowEditInit', () => {
    it('should add address cloned addresses list', () => {
      // arrange
      const clonedAddresses = (component as any).clonedAddresses;
      const address: Address = getAddresses(1)[0];

      // act
      component.onRowEditInit(address);
      const clonedAddress = clonedAddresses[1];

      // assert
      expect(address).toEqual(clonedAddress);
    });
  });

  describe('onRowEditSaveServer', () => {
    it('should add success message to toast and call to onRowEditSave when response is successful', () => {
      // arrange
      const expectedToastMessage = {severity: 'success', summary: 'Success', detail: 'Address was updated in server.'};
      const address: Address = getAddresses(1)[0];
      const index = 1;
      const subject = new Subject();
      addressServiceSpy.updateAddressToServer.and.returnValue(subject);
      spyOn(component as any, 'onRowEditSave');

      // act
      const result = component.onRowEditSaveServer(address, index);
      subject.next();
      subject.complete();

      // assert
      expect(messageServiceSpy.add).toHaveBeenCalledWith(expectedToastMessage);
      expect(component.onRowEditSave).toHaveBeenCalledWith(address, index);
    });

    it('should add error message to toast and call to onRowEditCancel when response is error', () => {
      // arrange
      const expectedToastMessage = {severity: 'error', summary: 'Error', detail: 'An error has occurred updating address in server.'};
      const address: Address = getAddresses(1)[0];
      const index = 1;
      const subject = new Subject();
      addressServiceSpy.updateAddressToServer.and.returnValue(subject);
      spyOn(component as any, 'onRowEditCancel');

      // act
      const result = component.onRowEditSaveServer(address, index);
      subject.error('Test error');
      subject.complete();

      // assert
      expect(messageServiceSpy.add).toHaveBeenCalledWith(expectedToastMessage);
      expect(component.onRowEditCancel).toHaveBeenCalledWith(address, index);
    });
  });

  describe('onRowEditSave', () => {
    it('should add success message to toast when response is successful', () => {
      // arrange
      const expectedToastMessage = {severity: 'success', summary: 'Success', detail: 'Address was updated.'};
      const address: Address = getAddresses(1)[0];
      const index = 1;
      const subject = new Subject();
      addressServiceSpy.updateAddress.and.returnValue(subject);

      // act
      const result = component.onRowEditSave(address, index);
      subject.next({isSuccessful: true});
      subject.complete();

      // assert
      expect(messageServiceSpy.add).toHaveBeenCalledWith(expectedToastMessage);
    });

    it('should add error message to toast and call to onRowEditCancel when response is empty', () => {
      // arrange
      const expectedToastMessage = {severity: 'error', summary: 'Error', detail: 'An error has occurred updating address.'};
      const address: Address = getAddresses(1)[0];
      const index = 1;
      const subject = new Subject();
      addressServiceSpy.updateAddress.and.returnValue(subject);
      spyOn(component as any, 'onRowEditCancel');

      // act
      const result = component.onRowEditSave(address, index);
      subject.next();
      subject.complete();

      // assert
      expect(messageServiceSpy.add).toHaveBeenCalledWith(expectedToastMessage);
      expect(component.onRowEditCancel).toHaveBeenCalledWith(address, index);
    });
  });

  describe('onRowEditCancel', () => {
    it('should return address to original values', () => {
      // arrange
      (component as any).clonedAddresses = {};
      const clonedAddresses = (component as any).clonedAddresses;
      const address: Address =  getAddresses(1)[0];
      const index = 0;
      component.addresses = [address];

      const expectedAddress = {
        Id: 1,
        StreetNumber: 'TestStreetNumber',
        Street: 'TestStreet',
        State: 'TestStat',
        Zip: 'TestZip',
        City: 'TestCity'
      };

      (clonedAddresses as any)[1] = expectedAddress;

        // act
      component.onRowEditCancel(address, index);

      // assert
      expect(Object.keys(clonedAddresses).length).toEqual(0, 'cloned addresses should be empty');
      expect(component.addresses[index]).toEqual(expectedAddress, 'address shuld return to original values');
    });
  });
});

function getAddresses(n: number): Address[] {
  const result: Address[] = [];

  for (let i = 1; i <= n; i++) {
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
