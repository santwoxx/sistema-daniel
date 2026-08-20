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
  // Deixa o navegador lidar com a requisição nativamente.
  // Ter este listener (mesmo vazio) satisfaz os requisitos de PWA para instalação,
  // mas evita erros de "Failed to fetch" ao repassar requisições cross-origin ou cacheadas.
});
