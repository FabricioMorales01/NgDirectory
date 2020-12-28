import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {WorkerHandler} from '../worker/worker-handler';
import {WorkerScripts} from '../worker/worker-scripts';
import {WorkerStatus} from '../enums/worker-status';
import {QueryOptions} from '../models/query-options';
import {Address} from '../models/address';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private static workerStatus = WorkerStatus.initial;

  private readonly URL_API = '/api';
  private readonly URL_DATA = 'https://0f1c6e64.s3.amazonaws.com/addresses.txt';

  constructor(private readonly workerHandler: WorkerHandler,
              private readonly http: HttpClient) { }

  /* Verifies if libs were loaded
  * @return true when libs are ready
  */
  public isLoadedLibs(): boolean {
    if (AddressService.workerStatus === WorkerStatus.initial) {
      this.loadLibs();
    }

    return AddressService.workerStatus >= WorkerStatus.loadedLibs;
  }

  /* Allows download pandas and numpy libraries
  * @return none
  */
  public loadLibs(): Observable<any> {
    AddressService.workerStatus = WorkerStatus.loadingLibs;
    const observable = this.workerHandler.executeScript(WorkerScripts.GetLoadDependenciesScript());
    observable.subscribe((res) => {
        if (!res?.error) {
          AddressService.workerStatus = WorkerStatus.loadedLibs;
        } else {
          AddressService.workerStatus = WorkerStatus.initial;
        }

        return res;
      });

    return observable;
  }

  /*  Load and retorn de first data section
  * @return matrix with address data
  */
  public loadData(): Observable<any> {
    AddressService.workerStatus = WorkerStatus.loadedData;
    const observable = this.workerHandler.executeScript(WorkerScripts.GetLoadDataScript(this.URL_DATA));

    observable.subscribe(res => {
        AddressService.workerStatus = WorkerStatus.loadedData;
      });

    return observable;
  }

  /*  Sort data
  * @param options: options with sort, pagination and filter values
  * @return matrix with address data
  */
  public executeQuery(options: QueryOptions): Observable<any> {
    (options as any).query = this.generateQueryString(options.filters);

    // Create parameter key, even as undefined
    options.sortField = options.sortField;
    options.sortAsc = options.sortAsc;
    options.pagSize = options.pagSize;
    options.pagNumber = options.pagNumber;

    return  this.workerHandler.executeScript(WorkerScripts.GetCustomQueryScript(options));
  }

  /*  Update local address
  * @param address: address to update
  * @return flag's confirmation
  */
  public updateAddress(address: Address): Observable<any> {
    return  this.workerHandler.executeScript(WorkerScripts.GetUpdateScript(address));
  }

  /*  Update address to service
  * @param address: address to update
  * @return flag's confirmation
  */
  public updateAddressToServer(address: Address): Observable<any> {
    const url = `${this.URL_API}/addresses`;
    return this.http.post(url, address);
  }

  /*  Generates a phyton sentence that allows filter by field
  * @param filters: filters list with values to filter
  * @return phyton script
  */
  private generateQueryString(filters: any): string {
    const keys = Object.keys(filters);
    const queriesList = [];
    let query = '';

    for (const key of keys) {
      const item = filters[key];
      const value =  (item?.value || '').trim().toLowerCase();
      if (!!value) {
        queriesList.push(`(result['${key}'].str.lower().str.${item.matchMode}('${value.trim()}'))`);
      }
    }

    if (queriesList.length > 0) {
      const criteria = queriesList.join(' & ');
      query = `result = result.loc[(${criteria})]`;
    }

    return query;
  }

}
