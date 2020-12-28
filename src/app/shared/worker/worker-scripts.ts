import {QueryOptions} from '../models/query-options';
import {Address} from '../models/address';

export class WorkerScripts {
  /* Get script to load python libs
  * @return script and input parameters
  */
  public static GetLoadDependenciesScript(): any {
    return {
      python: `
      import pytz
      import numpy as np
      import pyodide
    `};
  }

  /* Get script to load data from server
  * @param url: url to request data
  * @return script and input parameters
  */
  public static GetLoadDataScript(url: string): any {
    return {
      python: `
      import pandas as pd

      dfData = pd.read_csv(pyodide.open_url('${url}'), header=None)
      dfData.columns = ['Street', 'City', 'Zip']
      dfData.dropna(inplace = True)

      newStreet = dfData["Street"].str.split(" ", n = 1, expand = True)
      newZip = dfData["Zip"].str.split(" ", n = 2, expand = True)

      dfData["City"] = dfData["City"].str.strip()
      dfData["StreetNumber"] = newStreet[0].str.strip()
      dfData["Street"] = newStreet[1].str.strip()
      dfData["Zip"] = newZip[2].str.strip()
      dfData["State"] = newZip[1].str.strip()
      dfData['Id'] = range(1, 1 + len(dfData))

      totalData = dfData.shape[0]
      result = dfData[0:10].to_dict(orient="records")
      {"result": result, "total": totalData }
      `
    };
  }

  /* Get script to load data using different criteria
  * @param options: filter, pagination, and sorting values
  * @return script and input parameters
  */
  public static GetCustomQueryScript(options: QueryOptions): any {

    const script = `
      from js import sortField
      from js import sortAsc
      from js import pagSize
      from js import pagNumber

      result = dfData;
      if pagSize == None:
       pagSize = 10

      if pagNumber == None:
       pagNumber = 0

      ${ options.query }

      if sortField != None and sortAsc != None:
       result = result.sort_values(by=sortField, ascending=sortAsc)

      startPag = pagNumber * pagSize
      endPag = startPag + pagSize;
      totalData = result.shape[0]
      result = result[startPag:endPag]

      {"result": result.to_dict(orient="records"), "total": totalData }
    `;

    return {
      python: script,
      ...options
    };
  }

  /* Get script to update address in loaded data
  * @param address: target address
  * @return script and input parameters
  */
  public static GetUpdateScript(address: Address): any {

    const script = `
      from js import Id
      from js import StreetNumber
      from js import Street
      from js import City
      from js import Zip
      from js import State

      dfData.loc[dfData.Id == Id, 'StreetNumber'] = StreetNumber
      dfData.loc[dfData.Id == Id, 'Street'] = Street
      dfData.loc[dfData.Id == Id, 'City'] = City
      dfData.loc[dfData.Id == Id, 'Zip'] = Zip
      dfData.loc[dfData.Id == Id, 'State'] = State

      {"isSuccessful": True}
    `;

    return {
      python: script,
      ...address
    };
  }
}
