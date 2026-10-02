const CACHE="midterms-2026-v10";
const APP=["./","./index.html","./manifest.webmanifest","./icon.svg","./states.json","./house_baseline.json","./results.json"];
const MAPS=[
"https://raw.githubusercontent.com/amcharts/amcharts4-geodata/master/dist/script/json/region/usa/congressional120/usaCongressionalLow.json",
"https://cdn.amcharts.com/lib/4/geodata/json/region/usa/congressional120/usaCongressionalLow.json"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;

  if(event.request.mode==="navigate"){
    event.respondWith(
      fetch(event.request).then(resp=>{
        if(resp && resp.ok){
          const copy=resp.clone();
          caches.open(CACHE).then(c=>c.put("./index.html",copy));
        }
        return resp;
      }).catch(()=>caches.match("./index.html"))
    );
    return;
  }

  const url=new URL(event.request.url);

  if(url.origin===location.origin){
    event.respondWith(
      caches.match(event.request).then(cached=>{
        if(cached) return cached;
        return fetch(event.request).then(resp=>{
          if(resp && resp.ok){
            const copy=resp.clone();
            caches.open(CACHE).then(c=>c.put(event.request,copy));
          }
          return resp;
        });
      })
    );
    return;
  }

  if(MAPS.includes(event.request.url)){
    event.respondWith(
      caches.match(event.request).then(cached=>{
        if(cached) return cached;
        return fetch(event.request).then(resp=>{
          if(resp && resp.ok){
            const copy=resp.clone();
            caches.open(CACHE).then(c=>c.put(event.request,copy));
          }
          return resp;
        });
      })
    );
  }
});