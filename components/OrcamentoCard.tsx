"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge, Button, Card } from "@/components/ui";
import {
  formatarDataHora,
  linkTelefone,
  linkWhatsapp,
  ORCAMENTO_STATUS_COLOR,
  ORCAMENTO_STATUS_LABEL,
} from "@/lib/format";
import { atualizarStatusOrcamentoAction, excluirOrcamentoAction } from "@/lib/actions/orcamentos";
import type { StatusOrcamento } from "@/lib/mock-db/types";

export type OrcamentoResumo = {
  id: string;
  nome: string;
  telefone: string;
  descricao: string | null;
  fotoUrl: string | null;
  status: StatusOrcamento;
  criadoEm: string;
};

const PROXIMO_STATUS: Partial<Record<StatusOrcamento, { valor: StatusOrcamento; label: string }>> = {
  NOVO: { valor: "CONTATADO", label: "Marcar como contatado" },
  CONTATADO: { valor: "CONVERTIDO", label: "Marcar como convertido" },
};

export function OrcamentoCard({ orcamento }: { orcamento: OrcamentoResumo }) {
  const [isPending, startTransition] = useTransition();
  const [excluindo, setExcluindo] = useState(false);

  function mudarStatus(status: StatusOrcamento) {
    startTransition(() => {
      atualizarStatusOrcamentoAction(orcamento.id, status);
    });
  }

  function excluir() {
    if (!window.confirm(`Excluir o pedido de orçamento de ${orcamento.nome}?`)) return;
    setExcluindo(true);
    startTransition(async () => {
      await excluirOrcamentoAction(orcamento.id);
    });
  }

  const proximo = PROXIMO_STATUS[orcamento.status];

  const linkNovaMontagem =
    `/admin/montagens/nova?clienteNome=${encodeURIComponent(orcamento.nome)}` +
    `&clienteTelefone=${encodeURIComponent(orcamento.telefone)}` +
    (orcamento.descricao ? `&descricaoServico=${encodeURIComponent(orcamento.descricao)}` : "");

  return (
    <Card className={excluindo ? "opacity-50" : undefined}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {orcamento.fotoUrl ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200">
              <Image
                src={orcamento.fotoUrl}
                alt={`Foto enviada por ${orcamento.nome}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{orcamento.nome}</p>
            <p className="text-sm text-slate-500">{orcamento.telefone}</p>
            {orcamento.descricao ? (
              <p className="mt-1 text-sm text-slate-600">{orcamento.descricao}</p>
            ) : null}
            <p className="mt-1 text-xs text-slate-400">
              Recebido em {formatarDataHora(orcamento.criadoEm)}
            </p>
          </div>
        </div>
        <Badge className={ORCAMENTO_STATUS_COLOR[orcamento.status]}>
          {ORCAMENTO_STATUS_LABEL[orcamento.status]}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <a
          href={linkTelefone(orcamento.telefone)}
          className="inline-flex items-center gap-1 text-sm font-medium text-navy hover:text-gold transition-colors"
        >
          📞 Ligar
        </a>
        <a
          href={linkWhatsapp(orcamento.telefone)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline"
        >
          💬 WhatsApp
        </a>
        <Link
          href={linkNovaMontagem}
          className="inline-flex items-center gap-1 text-sm font-medium text-navy hover:text-gold transition-colors"
        >
          🛠️ Criar montagem
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        {proximo ? (
          <Button
            type="button"
            variante="secundario"
            className="px-3 py-2 text-sm"
            disabled={isPending}
            onClick={() => mudarStatus(proximo.valor)}
          >
            {proximo.label}
          </Button>
        ) : null}
        {orcamento.status !== "RECUSADO" ? (
          <Button
            type="button"
            variante="fantasma"
            className="px-3 py-2 text-sm"
            disabled={isPending}
            onClick={() => mudarStatus("RECUSADO")}
          >
            Marcar como recusado
          </Button>
        ) : null}
        <Button
          type="button"
          variante="fantasma"
          className="px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 hover:text-red-700"
          disabled={isPending}
          onClick={excluir}
        >
          Excluir
        </Button>
      </div>
    </Card>
  );
}
