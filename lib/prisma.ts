import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { MockPrismaClient } from "./mock-db/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Sem DATABASE_URL configurada (implantação nova, ainda não conectada a um
// Postgres de verdade), o sistema roda no banco mock em memória — só para
// dar uma olhada rápida no sistema sem precisar configurar nada antes. Os
// dados não sobrevivem a um reinício do servidor nesse modo; qualquer uso
// real (equipe cadastrando montagens de verdade) precisa de DATABASE_URL
// apontando para um Postgres (ex: Neon, veja o README).
function criarPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "DATABASE_URL não configurada — usando o banco mock em memória (os dados não são salvos entre reinícios). Configure DATABASE_URL para uso em produção."
    );
    // O mock imita a API do Prisma Client o suficiente para todas as ações
    // do sistema funcionarem, mas não é o mesmo tipo gerado pelo Prisma —
    // o cast é seguro aqui porque este ramo só roda sem um Postgres real.
    return new MockPrismaClient() as unknown as PrismaClient;
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? criarPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
