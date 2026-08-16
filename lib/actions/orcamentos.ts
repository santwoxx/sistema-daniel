"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apenasDigitos } from "@/lib/format";
import type { StatusOrcamento } from "@/lib/mock-db/types";

/**
 * Recebe o pedido de orçamento enviado pelo cliente na página pública
 * /orcamento (sem login — qualquer pessoa com o link pode enviar). A foto do
 * móvel é opcional: pedir demais no primeiro contato faz o cliente desistir
 * antes de enviar, e o admin sempre pode pedir a foto depois pelo WhatsApp.
 */
export async function criarOrcamentoAction(formData: FormData) {
  const erro = (mensagem: string) =>
    redirect(`/orcamento?erro=${encodeURIComponent(mensagem)}`);

  const nome = String(formData.get("nome") || "").trim();
  const telefone = String(formData.get("telefone") || "").trim();
  const descricaoBruta = String(formData.get("descricao") || "").trim();
  const foto = formData.get("foto");

  if (nome.length < 2) {
    erro("Informe seu nome.");
    return;
  }
  if (apenasDigitos(telefone).length < 10) {
    erro("Informe um telefone válido, com DDD.");
    return;
  }

  let fotoUrl: string | null = null;
  if (foto instanceof File && foto.size > 0) {
    if (!foto.type.startsWith("image/")) {
      erro("O arquivo da foto precisa ser uma imagem.");
      return;
    }
    if (foto.size > 8 * 1024 * 1024) {
      erro("A foto é muito grande (máximo 8 MB).");
      return;
    }
    const extensao = foto.type.split("/")[1] || "jpg";
    const blob = await put(`orcamentos/${Date.now()}.${extensao}`, foto, {
      access: "public",
      addRandomSuffix: true,
    });
    fotoUrl = blob.url;
  }

  await prisma.orcamento.create({
    data: {
      nome,
      telefone,
      descricao: descricaoBruta ? descricaoBruta.slice(0, 500) : null,
      fotoUrl,
      status: "NOVO",
      observacoesAdmin: null,
      criadoEm: new Date(),
    },
  });

  revalidatePath("/admin/orcamentos");
  revalidatePath("/admin");
  redirect("/orcamento?enviado=1");
}

// Muda o status de acompanhamento (ex: "contatei o cliente", "virou
// montagem", "recusou"). Puramente informativo para o admin organizar a
// fila — não altera nada em Montagem automaticamente.
export async function atualizarStatusOrcamentoAction(id: string, status: StatusOrcamento) {
  await requireAdmin();
  await prisma.orcamento.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orcamentos");
  revalidatePath("/admin");
}

export async function excluirOrcamentoAction(id: string) {
  await requireAdmin();
  await prisma.orcamento.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/orcamentos");
  revalidatePath("/admin");
}
