"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";

export function OrcamentoForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [nomeFoto, setNomeFoto] = useState<string | null>(null);
  const [previaFoto, setPreviaFoto] = useState<string | null>(null);

  function aoEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) {
      setNomeFoto(null);
      setPreviaFoto(null);
      return;
    }
    setNomeFoto(arquivo.name);
    setPreviaFoto(URL.createObjectURL(arquivo));
  }

  return (
    <form
      action={action}
      onSubmit={() => setEnviando(true)}
      className="space-y-4"
    >
      <Field label="Seu nome">
        <Input name="nome" required placeholder="Ex: Maria Souza" maxLength={120} />
      </Field>

      <Field label="Telefone / WhatsApp" hint="Vamos te chamar por aqui para combinar o orçamento.">
        <Input
          name="telefone"
          type="tel"
          required
          placeholder="(11) 91234-5678"
          inputMode="tel"
          maxLength={20}
        />
      </Field>

      <Field label="O que você precisa montar? (opcional)">
        <Textarea
          name="descricao"
          rows={3}
          maxLength={500}
          placeholder="Ex: guarda-roupa 6 portas, cozinha planejada, mesa..."
        />
      </Field>

      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700">
          Foto do móvel (opcional, mas ajuda muito no orçamento)
        </p>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-gold hover:bg-gold/5">
          {previaFoto ? (
            <span className="flex flex-col items-center gap-2">
              {/* Prévia local antes do envio — não é a foto salva no servidor. */}
              <img
                src={previaFoto}
                alt="Prévia da foto escolhida"
                className="h-24 w-24 rounded-lg object-cover shadow-sm"
              />
              <span className="text-xs font-medium text-slate-600">{nomeFoto} — toque para trocar</span>
            </span>
          ) : (
            <span className="flex flex-col items-center gap-1.5 text-slate-500">
              <span className="text-2xl">📷</span>
              <span className="text-sm font-medium">Toque para adicionar uma foto</span>
              <span className="text-xs">Da caixa do móvel, do catálogo ou do ambiente</span>
            </span>
          )}
          <input
            type="file"
            name="foto"
            accept="image/*"
            capture="environment"
            onChange={aoEscolherFoto}
            className="hidden"
          />
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar pedido de orçamento"}
      </Button>
    </form>
  );
}
