export default class ServiceWorkerHelper{

  constructor(workerLocation, openUICallback ){
    if(!navigator.serviceWorker) throw new Error("Service worker not supported")

    this.activeWorker = undefined;

    navigator.serviceWorker.register(workerLocation)
    .then( reg => {

      // if there is no service worker 
      if(!navigator.serviceWorker.controller) return // exit the function - don't need to listen to future events

      
      if(reg.waiting){  // if THIS new service worker waiting to be activated (loaded on previous page load and dismissed)
        this.activeWorker = reg.waiting; // make the new worker the active one
        openUICallback()  // show the updateUI
        return; // exit the function 
      }


      if(reg.installing){  // if THIS newly registered worker is still installing
        this.trackInstalling( reg.installing, openUICallback ) // wait till it finishes
      }

      reg.addEventListener('updatefound', ()=>{ // listen for state changes in THIS registed worker
        this.trackInstalling( reg.installing, openUICallback ) // when it has an update notify the user
      })


    }).catch((err)=>{
      throw new Error(`Service worker could not be registered: ${err.message}`)
    })

    // listen for if the controller switches service workers (e.g triggered by the skip waiting call below)
    navigator.serviceWorker.addEventListener('controllerchange', ()=>{
      window.location.reload();
    })

  }

  // functions depenant on instance
  
  // function to run when the service worker finishes installing
  trackInstalling(worker, callback){
    worker.addEventListener('statechange', ()=>{
      if(worker.state == 'installed'){
        this.activeWorker = worker;  // make the newly installed worker the active worker
        callback() // show the update UI
      }
    })
  }
  
  
  // function for dismissing the update to the service worker
  workerSkipWaiting = ()=>{
    if(this.activeWorker == undefined) throw new Error("No active worker");
    return this.activeWorker.postMessage({action: 'skipWaiting'})
  }
  
}