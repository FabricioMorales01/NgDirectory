import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Address} from '../../shared/models/address';
import {AddressService} from '../../shared/services/address.service';
import {QueryOptions} from '../../shared/models/query-options';
import {LazyLoadEvent, MessageService, SelectItem} from 'primeng/api';

@Component({
  selector: 'app-address-grid',
  templateUrl: './address-grid.component.html',
  styleUrls: ['./address-grid.component.scss']
})
export class AddressGridComponent implements OnInit {
  columns: any[] = [];
  addresses: Address[] = [];
  queryOptions: QueryOptions;
  matchModeOptions: SelectItem[];
  loading = false;
  totalRecords = 0;
  clonedAddresses: { [s: string]: Address; } = {};


  private isDataLoaded = false;

  constructor(private readonly addressService: AddressService,
              private readonly messageService: MessageService) {
    this.queryOptions = this.getQueryOptions();
    this.columns = this.getColumns();
    this.matchModeOptions = this.getMatchModeOptions();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  /*  Load data using filter, page, and filter parameters
  * @param event: event which contains parameters to search
  * @return none
  */
  loadData(event: LazyLoadEvent): void {
    if (!this.isDataLoaded) {
      return;
    }

    this.queryOptions.filters =  event.filters;
    this.queryOptions.pagNumber =  (event.first || 0)  / ( event.rows || 1);
    this.queryOptions.pagSize =  event.rows;
    this.queryOptions.sortField =  event.sortField;
    this.queryOptions.sortAsc =  event.sortOrder === 1;
    this.updateDataUsingQuery();
  }

  /*  Load data using current query options
  * @return none
  */
  updateDataUsingQuery(): void {
    this.loading = true;
    this.addressService.executeQuery(this.queryOptions)
      .subscribe(data => {
        this.setData(data.result || {}, data.total || 0);
        this.loading = false;
      });
  }

  /* It is executed when edit is initializing, it saves a clone of selected address
  * @param address: address that started edit process
  */
  onRowEditInit(address: Address): void {
    this.clonedAddresses[address.Id] = {...address};
  }

  /* Allows save address using server call
  * @param address: address to edit
  * @param index: index in current addresses list
  */
  onRowEditSaveServer(address: Address, index: number): void {
    this.loading = true;
    this.addressService.updateAddressToServer(address)
      .subscribe(() => {
        this.loading = false;
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Address was updated in server.'});
        this.onRowEditSave(address, index);
      }, () => {
        this.loading = false;
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'An error has occurred updating address in server.'});
        this.onRowEditCancel(address, index);
      });
  }

  /* Allows save address using local data
  * @param address: address to edit
  * @param index: index in current addresses list
  */
  onRowEditSave(address: Address, index: number): void {
    delete this.clonedAddresses[address.Id];
    this.loading = true;
    this.addressService.updateAddress(address).subscribe(res => {
      this.loading = false;
      if (res?.isSuccessful) {
        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Address was updated.'});
      } else {
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'An error has occurred updating address.'});
        this.onRowEditCancel(address, index);
      }
    });
  }

  /* It is executed when edit is cancelled
  * @param address: address to edit
  * @param index: index in current addresses list
  */
  onRowEditCancel(address: Address, index: number): void {
    this.addresses[index] = this.clonedAddresses[address.Id];
    delete this.clonedAddresses[address.Id];
  }

  /* Execute first call to data sr
  * @return none
  */
  private loadInitialData(): void {
    this.loading = true;
    this.addressService.loadData().subscribe((data) => {
      this.setData(data.result || {}, data.total || 0);
      this.loading = false;
      this.isDataLoaded = true;
    });
  }

  /* Set addresses list and total of records
  * @param addresses: addresses list
  * @param totalRecords: number total of records
  */
  private setData(addresses: any, totalRecords = 0): void {
    this.addresses = addresses;
    this.totalRecords = totalRecords;
  }

  private getColumns(): any[] {
    return [
      { field: 'StreetNumber', header: 'Street Number' },
      { field: 'Street', header: 'Brand' },
      { field: 'City', header: 'City' },
      { field: 'Zip', header: 'Zip' },
      { field: 'State', header: 'State' }
    ];
  }

  private getQueryOptions(): QueryOptions {
    return {
      pagNumber: 0,
      pagSize: 5,
      filters: {}
    };
  }

  private getMatchModeOptions(): SelectItem[]{
    return [
      { label: 'Contains', value: 'contains' },
      { label: 'Starts With', value: 'startswith' },
      { label: 'Ends With', value: 'endswith' },
    ];
  }
}
