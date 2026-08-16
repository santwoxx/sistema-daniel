import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function obterJwks() {
  if (!jwks) jwks = createRemoteJWKSet(new URL(JWKS_URL));
  return jwks;
}

export type ResultadoVerificacaoGoogle =
  | { ok: true; email: string; nome: string }
  | { ok: false; erro: string };

/**
 * Confere, direto na API REST do Firestore, se este e-mail está autorizado a
 * entrar como administrador — usando o próprio token do usuário como
 * credencial da chamada. Quem decide se a leitura do documento
 * "adminEmails/{email}" é permitida são as regras de segurança publicadas
 * no Firebase (firestore.rules), não uma lista guardada neste código. Isso
 * evita depender do SDK Admin do Firebase e de uma credencial de conta de
 * serviço só para essa checagem.
 */
async function autorizadoNoFirestore(
  idToken: string,
  projectId: string,
  emailToken: string
): Promise<boolean> {
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}` +
    `/databases/(default)/documents/adminEmails/${encodeURIComponent(emailToken)}`;

  const resposta = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
    cache: "no-store",
  });

  // 200 = a regra permitiu a leitura (documento existe e o e-mail do token
  // bate com o id dele). Qualquer outro status (403 sem permissão, 404 sem
  // o documento) conta como não autorizado.
  return resposta.ok;
}

export async function verificarTokenGoogle(
  idToken: string
): Promise<ResultadoVerificacaoGoogle> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return { ok: false, erro: "Login com Google não está configurado neste sistema." };
  }

  if (!idToken || typeof idToken !== "string") {
    return { ok: false, erro: "Token de login inválido." };
  }

  let payload;
  try {
    const resultado = await jwtVerify(idToken, obterJwks(), {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    payload = resultado.payload;
  } catch {
    return {
      ok: false,
      erro: "Não foi possível confirmar seu login do Google. Tente novamente.",
    };
  }

  // Usa o e-mail exatamente como está na claim do token (sem normalizar
  // caixa) para a checagem no Firestore — é esse valor exato que a regra
  // de segurança compara contra o id do documento.
  const emailToken = typeof payload.email === "string" ? payload.email : "";
  const emailVerificado = payload.email_verified === true;
  const nome =
    typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : emailToken;

  if (!emailToken || !emailVerificado) {
    return { ok: false, erro: "Sua conta do Google precisa ter o e-mail verificado." };
  }

  let autorizado: boolean;
  try {
    autorizado = await autorizadoNoFirestore(idToken, projectId, emailToken);
  } catch {
    return {
      ok: false,
      erro: "Não foi possível confirmar sua autorização agora. Tente novamente em instantes.",
    };
  }

  if (!autorizado) {
    return {
      ok: false,
      erro: "Este e-mail do Google não está autorizado a acessar o painel do administrador.",
    };
  }

  return { ok: true, email: emailToken.toLowerCase(), nome };
}
