import {Injectable} from '@angular/core';
import {observable, Observable, Subject, Subscriber} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkerHandler {
  private static readonly activePromises: any = {};
  private readonly pyodideWorker = new Worker('/assets/workers/webworker.js');

  /* Initialize execution to python script
  * @param options: script and input parameters
  * @return observable with script result
  */
  public executeScript(options: any): Observable<any> {
    const subject = new Subject();
    try {
      this.asyncRun(options)
        .then((res) => {
          subject.next(res || {} );
          subject.complete();
        }, (err) => {
          subject.next(err);
          subject.complete();
        });
    }
    catch (e){
      console.log(`Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`);
      subject.next(e);
      subject.complete();
    }

    return subject;
  }

  /* Run script in a async way
  * @param options: script and input parameters
  * @return promise with script result
  */
  private asyncRun(options: any): Promise<any> {
    return new Promise((onSuccess, onError) => {
      this.run(options, onSuccess, onError);
    });
  }

  /* Run a script and set pending promises queue
  * @param options: script and input parameters
  * @param success: callback if successful
  * @param fail: callback if error
  * @return none
  */
  private run(options: any, success: any, fail: any): void{
    // Generate unique identificator
    options.promiseId = this.getNewId();

    // Add promisse methods to list
    WorkerHandler.activePromises[options.promiseId] = {
      ...options,
      onSuccess: success,
      onError: fail
    };

    this.pyodideWorker.onerror = (res) =>  this.onError(res);
    this.pyodideWorker.onmessage = (e) => this.onSuccess(e.data);
    this.pyodideWorker.postMessage(options);
  }

  /* Execute error of a pending promise
  * @param res: script response
  * @return none
  */
  private onError(res: any): void {
    if (res.promiseId) {
      WorkerHandler.activePromises[res.promiseId]?.onError(res);
      delete WorkerHandler.activePromises[res.promiseId];
    }
  }

  /* Execute success of a pending promise
  * @param res: script response
  * @return none
  */
  private onSuccess(res: any): void {
    if (res.promiseId) {
      WorkerHandler.activePromises[res.promiseId]?.onSuccess(res.data);
      delete WorkerHandler.activePromises[res.promiseId];
    }
  }

  /* Generates new id
  * @return new id
  */
  private getNewId(): string {
    const num = Math.round(Math.random() * 10000);
    return `${Date.now()}${num}`;
  }
}
