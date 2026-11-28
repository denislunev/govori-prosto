const C='govori-v11';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','privacy.html','ladder.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const q=e.request;if(q.method!=='GET')return;
  const url=new URL(q.url);
  // audio: always store the whole file (never a 206 part); play from cache when present
  if(url.pathname.endsWith('.mp3')){
    e.respondWith(caches.open(C).then(c=>c.match(url.href).then(m=>m||fetch(url.href).then(r=>{if(r.status===200)c.put(url.href,r.clone());return r}))));
    return}
  e.respondWith(fetch(q).then(r=>{if(r.status===200){const cp=r.clone();caches.open(C).then(c=>c.put(q,cp))}return r})
    .catch(()=>caches.match(q).then(m=>m||(q.mode==='navigate'?caches.match('index.html'):Response.error()))));
});
