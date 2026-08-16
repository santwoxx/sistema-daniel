import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // "same-origin" (padrão do navegador em vários casos) isola a janela
        // do popup do Google e quebra o polling que o Firebase Auth faz em
        // popup.closed durante o signInWithPopup — o login com Google fica
        // preso em "Entrando…" para sempre. "same-origin-allow-popups"
        // mantém o isolamento entre origens diferentes, mas permite que esta
        // aba continue enxergando o popup que ela mesma abriu.
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  images: {
    // Fotos de comprovante/manual/ocorrência são enviadas para o Vercel
    // Blob (ver lib/actions/montagens.ts); fotos de referência vindas de
    // uma integração externa podem apontar para o Firebase Storage. Sem
    // isso, next/image recusa otimizar imagens hospedadas fora do domínio
    // do próprio site.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.firebasestorage.app" },
    ],
  },
};

export default nextConfig;
