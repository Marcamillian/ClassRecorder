'use strict';

// create caches for the files that we want to store offline
const staticCacheName = 'recorder-static-v1';
// collect all the cache names in an array to itterate over
let allCaches = [
  staticCacheName
]

// do things when the service worker installs
  // cache the right static files
self.addEventListener('install', (event)=>{
  console.log("service worker installed and ready to go")
  
  event.waitUntil(  // don't bubble the event untill
    caches.open(staticCacheName)  // the cache is open
    .then( cache =>{
      return cache.addAll([     // all files have been added to the cache
        // html
        '/',
        // images
        '/img/mic.svg',
        '/img/play-button.svg',
        // css
        '/styles/layout.css',
        '/styles/layout-350plus.css',
        '/styles/layout-600plus.css',
        '/styles/style.css',
        // javascript
        '/scripts/app.js',
        '/scripts/DbHelper.js',
        '/scripts/FilterModel.js',
        '/scripts/idb.js',
        '/scripts/ServiceWorkerHelper.js',
        '/scripts/StudentSelectModel.js',
        // data
        '/data/appData.json',
      ])
    })
  )
})

// things to do when the service worker becomes the newly active service worker
  // delete all the caches we no longer need  
self.addEventListener('activate', (event)=>{
  console.log("service worker is now the active worker")
  
  event.waitUntil(  // stop event bubbling until
    caches.keys()     // get the names of the caches
    .then( cacheNames =>{
      return Promise.all(   // wait for all cache names to be processed
        cacheNames.filter( cacheName =>{  // filter out the caches that are still on the allCaches list above
          return !allCaches.includes(cacheName) 
        }).map( cacheName =>{ 
          return caches.delete(cacheName) // delete the cache if its name not on the allCaches list
        })
      )
    })
  )
})

// intercept fetch requests

self.addEventListener('fetch', (event)=>{

  const requestUrl = new URL(event.request.url); // get an idea of where this fetch is going
  
  // offline first - only get from network if NOT already in cache

  if(requestUrl.origin == location.origin){ // if requested from our site
    event.respondWith(  // send back to the originator
      caches.match(event.request).then((response)=>{  // find the file in the cache
        return response || fetch(event.request) // respond with cache response OR a network request if we don't have it
      })
    )
  }
  
})


// listen for signals to skip waiting and become active service worker
self.addEventListener('message', (event)=>{
  if(event.data.action == 'skipWaiting') self.skipWaiting()
})
