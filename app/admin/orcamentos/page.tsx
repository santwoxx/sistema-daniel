import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PageHeader, Vazio } from "@/components/ui";
import { OrcamentoCard } from "@/components/OrcamentoCard";
import { CopiarTexto } from "@/components/CopiarTexto";

async function urlPublicaDeOrcamento() {
  const configurada = process.env.NEXT_PUBLIC_APP_URL;
  const base = configurada
    ? configurada.replace(/\/+$/, "")
    : await (async () => {
        const cabecalhos = await headers();
        const host = cabecalhos.get("host") ?? "localhost:3000";
        const proto =
          cabecalhos.get("x-forwarded-proto") ??
          (host.startsWith("localhost") ? "http" : "https");
        return `${proto}://${host}`;
      })();
  return `${base}/orcamento`;
}

// Fila de pedidos de orçamento enviados por clientes na página pública
// /orcamento (nome, telefone e foto do móvel, sem precisar de login). O
// admin liga/chama no WhatsApp, atualiza o status e, se fechar negócio,
// usa "Criar montagem" para levar os dados direto pro cadastro de montagem.
export default async function OrcamentosPage() {
  const [brutos, linkPublico] = await Promise.all([
    prisma.orcamento.findMany({ orderBy: { criadoEm: "desc" } }),
    urlPublicaDeOrcamento(),
  ]);

  const orcamentos = brutos.map((o) => ({
    id: o.id,
    nome: o.nome,
    telefone: o.telefone,
    descricao: o.descricao,
    fotoUrl: o.fotoUrl,
    status: o.status,
    criadoEm: o.criadoEm.toISOString(),
  }));

  const abertos = orcamentos.filter((o) => o.status === "NOVO" || o.status === "CONTATADO");
  const encerrados = orcamentos.filter((o) => o.status === "CONVERTIDO" || o.status === "RECUSADO");

  return (
    <div>
      <PageHeader
        titulo="Orçamentos"
        descricao="Pedidos enviados por clientes através do link público de orçamento."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <span className="text-slate-500">Link para divulgar aos clientes:</span>
        <span className="font-medium text-navy">{linkPublico}</span>
        <CopiarTexto texto={linkPublico} rotulo="Copiar link" />
      </div>

      {orcamentos.length === 0 ? (
        <Vazio>
          Nenhum pedido de orçamento recebido ainda. Compartilhe o link{" "}
          <strong>{linkPublico}</strong> com seus clientes.
        </Vazio>
      ) : (
        <>
          <div className="space-y-3">
            {abertos.length === 0 ? (
              <Vazio>Nenhum pedido em aberto no momento.</Vazio>
            ) : (
              abertos.map((o) => <OrcamentoCard key={o.id} orcamento={o} />)
            )}
          </div>

          {encerrados.length > 0 ? (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Encerrados
              </h2>
              <div className="space-y-3">
                {encerrados.map((o) => (
                  <OrcamentoCard key={o.id} orcamento={o} />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
