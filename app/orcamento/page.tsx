import { criarOrcamentoAction } from "@/lib/actions/orcamentos";
import { OrcamentoForm } from "@/components/OrcamentoForm";
import { Alerta, Card } from "@/components/ui";
import { Logo } from "@/components/Logo";

const VANTAGENS = [
  { icone: "⚡", texto: "Atendimento rápido" },
  { icone: "🛠️", texto: "Equipe profissional" },
  { icone: "💬", texto: "Combinado pelo WhatsApp" },
];

// Página pública (sem login) para o cliente pedir um orçamento de montagem:
// nome, telefone e, opcionalmente, uma foto do móvel. Cai direto na fila do
// admin em /admin/orcamentos.
export default async function OrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; enviado?: string }>;
}) {
  const { erro, enviado } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-navy px-4 pb-10 pt-10 text-center text-white">
        <Logo tamanho="lg" className="mx-auto mb-4" />
        <p className="text-2xl font-bold uppercase tracking-wide font-display">Águia</p>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Montagem de Móveis</p>
        <h1 className="mx-auto mt-3 max-w-sm text-xl font-semibold text-slate-100">
          Peça o orçamento da sua montagem
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-300">
          Preencha os dados abaixo e nossa equipe entra em contato para combinar tudo.
        </p>
        <div className="mx-auto mt-6 flex max-w-sm flex-wrap justify-center gap-x-5 gap-y-2">
          {VANTAGENS.map((v) => (
            <span key={v.texto} className="flex items-center gap-1.5 text-xs font-medium text-gold">
              <span>{v.icone}</span>
              {v.texto}
            </span>
          ))}
        </div>
      </header>

      <main className="mx-auto -mt-6 w-full max-w-md flex-1 px-4 pb-10">
        <Card className="shadow-lg shadow-navy/10">
          {enviado ? (
            <div className="py-4 text-center">
              <p className="mb-2 text-3xl">✅</p>
              <p className="text-base font-semibold text-slate-900">
                Pedido enviado com sucesso!
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Recebemos seus dados. Em breve entramos em contato pelo telefone
                informado para combinar o orçamento.
              </p>
            </div>
          ) : (
            <>
              {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
              <OrcamentoForm action={criarOrcamentoAction} />
            </>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          Seus dados são usados só para entrarmos em contato sobre este orçamento.
        </p>
      </main>
    </div>
  );
}
