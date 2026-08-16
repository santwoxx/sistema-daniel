"use client";

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function obterAuth() {
  const app = getApps().length ? getApp() : initializeApp(config);
  return getAuth(app);
}

/**
 * Abre o popup de login do Google e devolve o ID token do Firebase, que o
 * servidor confere (ver lib/googleAuth.ts) antes de criar a sessão do
 * sistema. Não guardamos a sessão do Firebase no navegador — só usamos o
 * token uma vez para autenticar aqui; quem controla o acesso depois disso é
 * o cookie de sessão do próprio sistema (httpOnly).
 */
export async function entrarComGoogle(): Promise<string> {
  const auth = obterAuth();
  const provider = new GoogleAuthProvider();
  const resultado = await signInWithPopup(auth, provider);
  const idToken = await resultado.user.getIdToken();
  await signOut(auth);
  return idToken;
}
