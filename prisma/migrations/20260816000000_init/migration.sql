-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MONTADOR');

-- CreateEnum
CREATE TYPE "StatusMontagem" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoOcorrencia" AS ENUM ('CLIENTE_AUSENTE', 'PECA_DANIFICADA', 'REAGENDAR', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusOrcamento" AS ENUM ('NOVO', 'CONTATADO', 'CONVERTIDO', 'RECUSADO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "fotoUrl" TEXT,
    "senha" TEXT,
    "role" "Role" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "comissaoPadrao" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lojas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT,
    "cnpj" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lojas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comissoes_loja" (
    "id" TEXT NOT NULL,
    "montadorId" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "comissoes_loja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "montagens" (
    "id" TEXT NOT NULL,
    "numeroPedido" TEXT,
    "lojaId" TEXT NOT NULL,
    "montadorId" TEXT,
    "clienteNome" TEXT NOT NULL,
    "clienteTelefone" TEXT,
    "clienteEndereco" TEXT NOT NULL,
    "descricaoServico" TEXT NOT NULL,
    "valorServico" DOUBLE PRECISION NOT NULL,
    "percentualMontador" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorMontador" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorAssistencia" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feitoPorAdm" BOOLEAN NOT NULL DEFAULT false,
    "dataAgendada" TIMESTAMP(3),
    "status" "StatusMontagem" NOT NULL DEFAULT 'PENDENTE',
    "pagoPelaLoja" BOOLEAN NOT NULL DEFAULT false,
    "pagoAoMontador" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "concluidoEm" TIMESTAMP(3),
    "fotoProdutoUrl" TEXT,
    "assinaturaMontador" TEXT,
    "assinaturaCliente" TEXT,
    "manualUrl" TEXT,
    "manualNomeArquivo" TEXT,
    "manualTipo" TEXT,
    "notificadoCentralSyncEm" TIMESTAMP(3),
    "avaliacaoSolicitadaEm" TIMESTAMP(3),

    CONSTRAINT "montagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_pendentes" (
    "id" TEXT NOT NULL,
    "numeroPedido" TEXT,
    "clienteNome" TEXT NOT NULL,
    "clienteTelefone" TEXT,
    "clienteEndereco" TEXT NOT NULL,
    "descricaoServico" TEXT NOT NULL,
    "valorServico" DOUBLE PRECISION,
    "dataAgendada" TIMESTAMP(3),
    "observacoes" TEXT,
    "lojaNomeSugerida" TEXT,
    "lojaCnpjSugerido" TEXT,
    "fotoReferenciaUrl" TEXT,
    "montadorSugeridoId" TEXT,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_pendentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocorrencias" (
    "id" TEXT NOT NULL,
    "montagemId" TEXT NOT NULL,
    "tipo" "TipoOcorrencia" NOT NULL,
    "observacao" TEXT,
    "fotoUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ocorrencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "montagemId" TEXT NOT NULL,
    "montadorId" TEXT NOT NULL,
    "estrelas" INTEGER NOT NULL,
    "comentario" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "descricao" TEXT,
    "fotoUrl" TEXT,
    "status" "StatusOrcamento" NOT NULL DEFAULT 'NOVO',
    "observacoesAdmin" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lojas_cnpj_key" ON "lojas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "comissoes_loja_montadorId_lojaId_key" ON "comissoes_loja"("montadorId", "lojaId");

-- CreateIndex
CREATE INDEX "montagens_status_idx" ON "montagens"("status");

-- CreateIndex
CREATE INDEX "montagens_montadorId_idx" ON "montagens"("montadorId");

-- CreateIndex
CREATE INDEX "montagens_lojaId_idx" ON "montagens"("lojaId");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_montagemId_key" ON "avaliacoes"("montagemId");

-- AddForeignKey
ALTER TABLE "comissoes_loja" ADD CONSTRAINT "comissoes_loja_montadorId_fkey" FOREIGN KEY ("montadorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes_loja" ADD CONSTRAINT "comissoes_loja_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "lojas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "montagens" ADD CONSTRAINT "montagens_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "lojas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "montagens" ADD CONSTRAINT "montagens_montadorId_fkey" FOREIGN KEY ("montadorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_pendentes" ADD CONSTRAINT "notas_pendentes_montadorSugeridoId_fkey" FOREIGN KEY ("montadorSugeridoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_montagemId_fkey" FOREIGN KEY ("montagemId") REFERENCES "montagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_montagemId_fkey" FOREIGN KEY ("montagemId") REFERENCES "montagens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_montadorId_fkey" FOREIGN KEY ("montadorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

