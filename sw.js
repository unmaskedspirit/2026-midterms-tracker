const CACHE="midterms-2026-v1";
const APP=["./","./index.html","./manifest.webmanifest","./icon.svg"];
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
  const url=new URL(event.request.url);

  if(url.origin===location.origin){
    event.respondWith(
      caches.match(event.request).then(cached=>{
        const network=fetch(event.request).then(resp=>{
          if(resp && resp.ok){
            const copy=resp.clone();
            caches.open(CACHE).then(c=>c.put(event.request,copy));
          }
          return resp;
        }).catch(()=>cached);
        return cached || network;
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