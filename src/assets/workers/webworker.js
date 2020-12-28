self.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.15.0/full/';
importScripts('https://cdn.jsdelivr.net/pyodide/v0.15.0/full/pyodide.js');

let pythonLoading;
async function loadPythonPackages(){
  await languagePluginLoader;
  pythonLoading = self.pyodide.loadPackage(['numpy', 'pandas']);
}


var onmessage = async(event) => {
  await languagePluginLoader;

  await pythonLoading;

  const {python, promiseId, ...context} = event.data;
  for (const key of Object.keys(context)){
    self[key] = context[key];
  }

  try {
    const result = await self.pyodide.runPythonAsync(python);
    self.postMessage({
        data: result,
        promiseId: promiseId
      });
  }
  catch (error){
    self.postMessage(
      {error : error.message,
        promiseId: promiseId}
    );
  }
}
