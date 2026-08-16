const CACHE_NAME = "aguia-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pré-cache vazio por enquanto
      return cache.addAll([]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Faz esta versão assumir imediatamente as abas já abertas, sem esperar
  // todas fecharem — evita uma aba antiga continuar rodando um bundle de
  // uma versão anterior do site depois de um novo deploy.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Só GET passa por aqui. Reembrulhar um POST (como as chamadas de Server
  // Action) num novo fetch(event.request) pode falhar com "Failed to
  // fetch" em alguns navegadores, porque o corpo da requisição original já
  // foi lido nesse ponto — e não tem nenhum ganho de cache em fazer isso
  // mesmo para GET hoje, mas evita esse efeito colateral específico.
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request));
});
