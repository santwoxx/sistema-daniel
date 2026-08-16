"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { verificarTokenGoogle } from "@/lib/googleAuth";

// Só aceita um "próximo destino" vindo do login se for um caminho relativo
// do próprio site (começando com uma única "/") — impede um redirect aberto
// (ex: "//evil.com" ou "https://evil.com") caso alguém adultere a URL.
function destinoSeguro(proximo: unknown, padrao: string) {
  const texto = String(proximo || "");
  if (texto.startsWith("/") && !texto.startsWith("//")) return texto;
  return padrao;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const senha = String(formData.get("senha") || "");
  const proximo = formData.get("proximo");

  const erro = (mensagem: string) =>
    redirect(`/login?erro=${encodeURIComponent(mensagem)}`);

  if (!email || !senha) {
    erro("Informe e-mail e senha.");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.ativo || !user.senha) {
    erro("E-mail ou senha incorretos.");
    return;
  }

  // Administrador só entra pelo Google — e-mail/senha é exclusivo para
  // montadores/colaboradores cadastrados pelo admin no painel.
  if (user.role === "ADMIN") {
    erro("Administradores entram com o botão \"Entrar com Google\".");
    return;
  }

  const senhaValida = await verifyPassword(senha, user.senha);
  if (!senhaValida) {
    erro("E-mail ou senha incorretos.");
    return;
  }

  await createSession({ sub: user.id, role: user.role, nome: user.nome });
  redirect(destinoSeguro(proximo, "/montador"));
}

/**
 * Login do administrador via Google (Firebase Auth no navegador). O token
 * chega já assinado pelo Google; a verificação da assinatura e a checagem
 * de autorização (regras do Firestore) acontecem no servidor
 * (lib/googleAuth.ts) — nunca confiamos em e-mail/nome que o navegador diga
 * ter.
 */
export async function loginComGoogleAction(
  idToken: string,
  proximo?: string
): Promise<{ ok: true; destino: string } | { ok: false; erro: string }> {
  const resultado = await verificarTokenGoogle(idToken);
  if (!resultado.ok) return resultado;

  const { email, nome } = resultado;

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { nome, email, role: "ADMIN", ativo: true, comissaoPadrao: 0 },
      });
    } else if (!user.ativo) {
      return { ok: false, erro: "Este usuário está desativado." };
    }

    await createSession({ sub: user.id, role: user.role, nome: user.nome });
    return { ok: true, destino: destinoSeguro(proximo ?? null, "/admin") };
  } catch (e) {
    console.error("loginComGoogleAction: falha ao criar sessão", e);
    return {
      ok: false,
      erro: "Login confirmado, mas houve um problema ao abrir sua sessão. Tente novamente.",
    };
  }
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
