// Configuração do Prisma CLI (migrate, generate, studio...) — não é lida
// pelo Next.js em si (que já carrega o .env sozinho), só pelos comandos
// "npx prisma ...". A partir do Prisma 7 a URL de conexão sai do
// schema.prisma e vem para cá.
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Placeholder só para permitir "prisma generate" (que não abre conexão
// nenhuma) rodar sem DATABASE_URL configurada — ex: banco mock local, ou
// build do zero antes de configurar um Postgres de verdade. O helper
// env(...) do Prisma 7 lança erro se a variável estiver ausente/vazia, então
// usamos process.env direto com este valor de reserva.
const SEM_BANCO_CONFIGURADO = "postgresql://user:password@localhost:5432/db?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Esta URL só é usada pela CLI do Prisma (migrate, studio, db pull/push) —
  // o app em si nunca lê este arquivo, ele conecta direto via o adapter em
  // lib/prisma.ts (usando DATABASE_URL, a conexão pooled). Aqui preferimos
  // DIRECT_URL (conexão direta, sem pooler) de propósito: é o que as
  // migrations precisam, já que o pooler do Neon (pgbouncer em modo
  // transaction) não suporta os locks/DDL do motor de migrations.
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || SEM_BANCO_CONFIGURADO,
  },
});
