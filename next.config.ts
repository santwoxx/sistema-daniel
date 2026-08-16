import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
