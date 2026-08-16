"use client";

import type { FirebaseOptions } from "firebase/app";

const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Abre o popup de login do Google e devolve o ID token do Firebase, que o
 * servidor confere (ver lib/googleAuth.ts) antes de criar a sessão do
 * sistema. Não guardamos a sessão do Firebase no navegador — só usamos o
 * token uma vez para autenticar aqui; quem controla o acesso depois disso é
 * o cookie de sessão do próprio sistema (httpOnly).
 *
 * Os pacotes "firebase/app" e "firebase/auth" só são importados aqui dentro
 * (nunca no topo do arquivo) de propósito: importar o SDK do Firebase Auth
 * dispara uma inicialização própria dele que depende de IndexedDB. Mesmo
 * este arquivo sendo "use client", o Next.js ainda avalia o módulo uma vez
 * no servidor ao renderizar a página pela primeira vez (SSR) — e um import
 * estático rodaria essa inicialização num ambiente Node sem IndexedDB de
 * verdade, quebrando a página. Um import dinâmico dentro da função só
 * executa quando alguém realmente clica no botão, ou seja, só no navegador.
 */
export async function entrarComGoogle(): Promise<string> {
  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = await import(
    "firebase/auth"
  );

  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const resultado = await signInWithPopup(auth, provider);
  const idToken = await resultado.user.getIdToken();
  await signOut(auth);
  return idToken;
}
