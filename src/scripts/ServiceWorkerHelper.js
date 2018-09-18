
// function to call to set up a service worker
const ServiceWorkerHelper = function ServiceWorkerHelper(workerLocation, openUICallback){
  
  // check if service worker compatible 
  if(!navigator.serviceWorker) throw new Error("Service worker not supported")

  let activeWorker;

  navigator.serviceWorker.register(workerLocation).then( reg => {

    // if there is no service worker 
    if(!navigator.serviceWorker.controller) return // exit the function

    
    if(reg.waiting){  // if THIS new service worker waiting to be activated (loaded on previous page load and dismissed)
      activeWorker = reg.waiting; // make the new worker the active one
      openUICallback()  // show the updateUI
      return; // exit the function 
    }


    if(reg.installing){  // if THIS newly registered worker is still installing
      //trackInstalling(reg.installing) // wait till it finishes
    }

    reg.addEventListener('updatefound', ()=>{ // listen for state changes in THIS registed worker
      //trackInstalling(reg.installing) // when it has an update notify the user
    })


  }).catch((err)=>{
    throw new Error(`Service worker could not be registered: ${err.message}`)
  })

  // listen for if the controller switches service workers (e.g triggered by the skip waiting call below)
  navigator.serviceWorker.addEventListener('controllerchange', ()=>{
    window.location.reload();
  })


  // function to run when the service worker finishes installing
  const trackInstalling = (worker)=>{
    worker.addEventListener('statechange', ()=>{
      if(worker.state == 'installed'){
        activeWorker = worker;  // make the newly installed worker the active worker
        openUICallback() // show the update UI
      }
    })
  }

  // function for dismissing the update to the service worker
  const workerSkipWaiting = ()=>{
    if(activeWorker == undefined) throw new Error("No active worker");
    return activeWorker.postMessage({action: 'skipWaiting'})
  }

  // expose skip waiting to be called externally
  return{
    workerSkipWaiting 
  }
}