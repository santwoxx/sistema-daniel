"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { entrarComGoogle } from "@/lib/firebase";
import { loginComGoogleAction } from "@/lib/actions/auth";

export function GoogleLoginButton({
  habilitado,
  proximo,
}: {
  habilitado: boolean;
  proximo?: string;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!habilitado) {
    return (
      <div>
        <Button type="button" variante="secundario" className="w-full" disabled>
          Entrar com Google
        </Button>
        <p className="mt-2 text-center text-xs text-slate-400">
          Login com Google desativado — configure o Firebase para ativar (veja o README).
        </p>
      </div>
    );
  }

  async function entrar() {
    setErro(null);
    setCarregando(true);
    try {
      const idToken = await entrarComGoogle();
      const resultado = await loginComGoogleAction(idToken, proximo);
      if (!resultado.ok) {
        setErro(resultado.erro);
        setCarregando(false);
        return;
      }
      router.push(resultado.destino);
      router.refresh();
    } catch (e) {
      const codigo = (e as { code?: string } | null)?.code;
      if (codigo !== "auth/popup-closed-by-user" && codigo !== "auth/cancelled-popup-request") {
        setErro("Não foi possível entrar com o Google. Tente novamente.");
      }
      setCarregando(false);
    }
  }

  return (
    <div>
      {erro ? <p className="mb-2 text-center text-sm text-red-600">{erro}</p> : null}
      <Button
        type="button"
        variante="secundario"
        className="w-full"
        disabled={carregando}
        onClick={entrar}
      >
        {carregando ? "Entrando…" : "Entrar com Google"}
      </Button>
    </div>
  );
}
