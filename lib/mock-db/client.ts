import {
  usersData,
  lojasData,
  comissoesData,
  montagensData,
  notasData,
  ocorrenciasData,
  avaliacoesData,
  orcamentosData,
} from "./data";
import {
  User,
  Loja,
  ComissaoLoja,
  Montagem,
  NotaPendente,
  Ocorrencia,
  Avaliacao,
  Orcamento,
} from "./types";

// Utilitário simples para gerar IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Operadores de filtro do Prisma que este mock entende (aplicados com
// semântica "E" quando vários aparecem juntos no mesmo campo, igual ao
// Prisma de verdade).
const OPERADORES = new Set([
  "not",
  "in",
  "notIn",
  "gte",
  "lte",
  "gt",
  "lt",
  "equals",
  "startsWith",
  "endsWith",
  "contains",
  "mode",
]);

function paraComparar(valor: unknown, mode?: string): string {
  const texto = String(valor ?? "");
  return mode === "insensitive" ? texto.toLowerCase() : texto;
}

// Avalia uma condição de filtro (valor de um campo dentro de um "where")
// contra o valor real do item — cobre igualdade direta, os operadores acima
// (not/in/gte/lte/startsWith/contains/mode "insensitive" etc.) e null.
function avaliarCondicao(valorDoItem: any, condicao: any): boolean {
  if (condicao === undefined) return true;
  if (condicao === null || typeof condicao !== "object" || condicao instanceof Date) {
    return valorDoItem === condicao;
  }

  const chaves = Object.keys(condicao);
  if (!chaves.some((k) => OPERADORES.has(k))) {
    // Não é um operador conhecido — não deveria chegar aqui (ver
    // avaliarWhere, que trata esse formato como chave única composta antes
    // de cair aqui), mas por segurança compara por igualdade profunda rasa.
    return valorDoItem === condicao;
  }

  const mode = condicao.mode as string | undefined;
  if (condicao.equals !== undefined && paraComparar(valorDoItem, mode) !== paraComparar(condicao.equals, mode)) {
    return false;
  }
  if (condicao.not !== undefined && valorDoItem === condicao.not) return false;
  if (condicao.in !== undefined && !condicao.in.includes(valorDoItem)) return false;
  if (condicao.notIn !== undefined && condicao.notIn.includes(valorDoItem)) return false;
  if (condicao.gte !== undefined && !(valorDoItem >= condicao.gte)) return false;
  if (condicao.lte !== undefined && !(valorDoItem <= condicao.lte)) return false;
  if (condicao.gt !== undefined && !(valorDoItem > condicao.gt)) return false;
  if (condicao.lt !== undefined && !(valorDoItem < condicao.lt)) return false;
  if (
    condicao.startsWith !== undefined &&
    !paraComparar(valorDoItem, mode).startsWith(paraComparar(condicao.startsWith, mode))
  ) {
    return false;
  }
  if (
    condicao.endsWith !== undefined &&
    !paraComparar(valorDoItem, mode).endsWith(paraComparar(condicao.endsWith, mode))
  ) {
    return false;
  }
  if (
    condicao.contains !== undefined &&
    !paraComparar(valorDoItem, mode).includes(paraComparar(condicao.contains, mode))
  ) {
    return false;
  }
  return true;
}

// Avalia um "where" inteiro (com AND/OR/NOT e chaves únicas compostas, ex:
// "montadorId_lojaId") contra um item.
function avaliarWhere(item: any, where: any): boolean {
  if (!where) return true;

  if (where.AND && !(where.AND as any[]).every((w) => avaliarWhere(item, w))) return false;
  if (where.OR && !(where.OR as any[]).some((w) => avaliarWhere(item, w))) return false;
  if (where.NOT) {
    const nots = Array.isArray(where.NOT) ? where.NOT : [where.NOT];
    if (nots.some((w: any) => avaliarWhere(item, w))) return false;
  }

  return Object.entries(where).every(([chave, valor]) => {
    if (chave === "AND" || chave === "OR" || chave === "NOT") return true;

    const valorNoItem = item[chave];
    const ehObjetoPlano =
      valor !== null && typeof valor === "object" && !Array.isArray(valor) && !(valor instanceof Date);

    if (valorNoItem === undefined && ehObjetoPlano) {
      const subChaves = Object.keys(valor);
      if (!subChaves.some((k) => OPERADORES.has(k))) {
        // Campo que não existe direto no item + objeto sem operador =
        // provavelmente uma chave única composta (ex: montadorId_lojaId:
        // { montadorId, lojaId }) — compara os subcampos direto no item.
        return subChaves.every((sub) => item[sub] === (valor as any)[sub]);
      }
    }

    return avaliarCondicao(valorNoItem, valor);
  });
}

// Ordena por um único critério (objeto) ou vários em sequência (array de
// objetos, ex: orderBy: [{ dataAgendada: "asc" }, { createdAt: "desc" }]) —
// cada critério só desempata o anterior, igual ao Prisma de verdade.
function ordenarPor<T>(lista: T[], orderBy: any): T[] {
  if (!orderBy) return lista;
  const criterios: [string, "asc" | "desc"][] = (Array.isArray(orderBy) ? orderBy : [orderBy])
    .map((spec) => Object.entries(spec)[0] as [string, "asc" | "desc"])
    .filter(Boolean);
  if (criterios.length === 0) return lista;

  return [...lista].sort((a, b) => {
    for (const [campo, direcao] of criterios) {
      const valA = (a as any)[campo];
      const valB = (b as any)[campo];
      if (valA < valB) return direcao === "asc" ? -1 : 1;
      if (valA > valB) return direcao === "asc" ? 1 : -1;
    }
    return 0;
  });
}

function projetarSelecao(item: any, select: any): any {
  const saida: any = {};
  for (const campo of Object.keys(select)) {
    if (select[campo]) saida[campo] = item?.[campo];
  }
  return saida;
}

// Aplica um "select"/"orderBy"/"where"/"take" aninhado dentro de um include
// (ex: montador: { select: { nome: true } }, ocorrencias: { orderBy: {...} }).
function refinarRelacao(valor: any, spec: any): any {
  if (valor === null || valor === undefined || spec === true) return valor;
  if (typeof spec !== "object") return valor;

  let resultado = valor;
  if (Array.isArray(resultado)) {
    if (spec.where) resultado = resultado.filter((v: any) => avaliarWhere(v, spec.where));
    if (spec.orderBy) resultado = ordenarPor(resultado, spec.orderBy);
    if (spec.take) resultado = resultado.slice(0, spec.take);
    if (spec.select) resultado = resultado.map((v: any) => projetarSelecao(v, spec.select));
    return resultado;
  }

  return spec.select ? projetarSelecao(resultado, spec.select) : resultado;
}

// Descreve como resolver, a partir de um item, cada relação que pode
// aparecer num "include"/"select" (ex: Montagem -> loja, Montagem ->
// ocorrencias). Os mesmos resolvedores também alimentam "_count".
type Resolvedor<T> = (item: T) => any;
type ConfigRelacoes<T> = Record<string, Resolvedor<T>>;

class MockCollection<T extends { id: string }> {
  constructor(
    private data: T[],
    private relacoes: ConfigRelacoes<T> = {},
    // Espelha os "@default(...)" do schema.prisma para os campos que uma
    // action pode legitimamente omitir ao criar (esperando que o banco
    // preencha sozinho) — ex: Loja.ativo, Montagem.status. Sem isso, esses
    // campos ficam "undefined" no mock, e telas que filtram por eles (ex:
    // "ativo: true", login que exige o montador ativo) se comportam como se
    // o registro recém-criado não existisse.
    private padroes: Partial<T> = {}
  ) {}

  private aplicarIncludeOuSelect(item: T, args?: { include?: any; select?: any }): any {
    const resolverCampo = (saida: any, campo: string, spec: any) => {
      if (campo === "_count") {
        const selecaoContagem = (spec && typeof spec === "object" && spec.select) || {};
        saida._count = {};
        for (const nomeRelacao of Object.keys(selecaoContagem)) {
          const resolvedor = this.relacoes[nomeRelacao];
          const valor = resolvedor ? resolvedor(item) : undefined;
          saida._count[nomeRelacao] = Array.isArray(valor) ? valor.length : 0;
        }
        return;
      }
      const resolvedor = this.relacoes[campo];
      if (!resolvedor) return;
      saida[campo] = refinarRelacao(resolvedor(item), spec);
    };

    if (args?.select) {
      const saida: any = {};
      for (const [campo, spec] of Object.entries(args.select)) {
        if (!spec) continue;
        if (campo === "_count" || this.relacoes[campo]) {
          resolverCampo(saida, campo, spec);
        } else {
          saida[campo] = (item as any)[campo];
        }
      }
      return saida;
    }

    if (args?.include) {
      const saida: any = { ...item };
      for (const [campo, spec] of Object.entries(args.include)) {
        if (!spec) continue;
        resolverCampo(saida, campo, spec);
      }
      return saida;
    }

    return item;
  }

  async findMany(args?: { where?: any; orderBy?: any; include?: any; select?: any; take?: number; skip?: number }): Promise<T[]> {
    let result = [...this.data];

    if (args?.where) {
      result = result.filter((item) => avaliarWhere(item, args.where));
    }

    if (args?.orderBy) {
      result = ordenarPor(result, args.orderBy);
    }

    if (args?.skip) result = result.slice(args.skip);
    if (args?.take) result = result.slice(0, args.take);

    if (args?.include || args?.select) {
      result = result.map((item) => this.aplicarIncludeOuSelect(item, args)) as T[];
    }

    return result;
  }

  async findUnique(args: { where: any; include?: any; select?: any }): Promise<T | null> {
    const items = await this.findMany({ where: args.where, include: args.include, select: args.select });
    return items[0] || null;
  }

  async findFirst(args?: { where?: any; orderBy?: any; include?: any; select?: any }): Promise<T | null> {
    const items = await this.findMany(args);
    return items[0] || null;
  }

  async create(args: { data: any }): Promise<T> {
    const agora = new Date();
    const newItem = {
      id: generateId(),
      ...this.padroes,
      ...args.data,
      // Assim como os defaults acima, os campos de data/hora automáticos
      // (createdAt/updatedAt ou criadoEm, dependendo do modelo) também
      // vêm do banco de verdade — nunca de quem chama a action.
      createdAt: agora,
      updatedAt: agora,
      criadoEm: agora,
    } as T;
    this.data.push(newItem);
    return newItem;
  }

  async update(args: { where: any; data: any }): Promise<T> {
    const index = this.data.findIndex((item) => avaliarWhere(item, args.where));
    if (index === -1) throw new Error("Record not found");

    this.data[index] = { ...this.data[index], ...args.data, updatedAt: new Date() };
    return this.data[index];
  }

  async upsert(args: { where: any; update: any; create: any }): Promise<T> {
    const existing = await this.findUnique({ where: args.where });
    if (existing) {
      return this.update({ where: args.where, data: args.update });
    } else {
      return this.create({ data: args.create });
    }
  }

  async delete(args: { where: any }): Promise<T> {
    const index = this.data.findIndex((item) => avaliarWhere(item, args.where));
    if (index === -1) throw new Error("Record not found");

    const deleted = this.data[index];
    this.data.splice(index, 1);
    return deleted;
  }

  async count(args?: { where?: any }): Promise<number> {
    const items = await this.findMany({ where: args?.where });
    return items.length;
  }

  async aggregate(args: { where?: any; _sum?: any; _count?: any; _avg?: any }): Promise<any> {
    const items = await this.findMany({ where: args?.where });

    const result: any = {};
    if (args._sum) {
      result._sum = {};
      for (const key of Object.keys(args._sum)) {
        result._sum[key] = items.reduce((acc, curr) => acc + ((curr as any)[key] || 0), 0);
      }
    }
    if (args._avg) {
      result._avg = {};
      for (const key of Object.keys(args._avg)) {
        const valores = items.map((i) => (i as any)[key]).filter((v) => v != null);
        result._avg[key] = valores.length ? valores.reduce((acc, v) => acc + v, 0) / valores.length : null;
      }
    }
    if (args._count) {
      result._count = {};
      for (const key of Object.keys(args._count)) {
        if (key === "_all") {
          result._count._all = items.length;
        } else {
          result._count[key] = items.filter(i => (i as any)[key] != null).length;
        }
      }
    }
    return result;
  }

  async groupBy(args: { by: string[]; where?: any; _sum?: any; _count?: any; _avg?: any }): Promise<any[]> {
    const items = await this.findMany({ where: args?.where });

    const groups: Record<string, any[]> = {};
    for (const item of items) {
      const key = args.by.map((b) => String((item as any)[b])).join("-");
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }

    return Object.values(groups).map((groupItems) => {
      const rep = groupItems[0];
      const result: any = {};
      for (const b of args.by) result[b] = (rep as any)[b];

      if (args._sum) {
        result._sum = {};
        for (const key of Object.keys(args._sum)) {
          result._sum[key] = groupItems.reduce((acc, curr) => acc + ((curr as any)[key] || 0), 0);
        }
      }
      if (args._avg) {
        result._avg = {};
        for (const key of Object.keys(args._avg)) {
          const valores = groupItems.map((i) => (i as any)[key]).filter((v) => v != null);
          result._avg[key] = valores.length ? valores.reduce((acc, v) => acc + v, 0) / valores.length : null;
        }
      }
      if (args._count) {
        result._count = {};
        for (const key of Object.keys(args._count)) {
          if (key === "_all") {
            result._count._all = groupItems.length;
          } else {
            result._count[key] = groupItems.filter(i => (i as any)[key] != null).length;
          }
        }
      }
      return result;
    });
  }
}

export class MockPrismaClient {
  user = new MockCollection<User>(
    usersData,
    { montagens: (u) => montagensData.filter((m) => m.montadorId === u.id) },
    { ativo: true, comissaoPadrao: 0 }
  );
  loja = new MockCollection<Loja>(
    lojasData,
    { montagens: (l) => montagensData.filter((m) => m.lojaId === l.id) },
    { ativo: true }
  );
  comissaoLoja = new MockCollection<ComissaoLoja>(comissoesData);
  montagem = new MockCollection<Montagem>(
    montagensData,
    {
      loja: (m) => lojasData.find((l) => l.id === m.lojaId) ?? null,
      montador: (m) => usersData.find((u) => u.id === m.montadorId) ?? null,
      avaliacao: (m) => avaliacoesData.find((a) => a.montagemId === m.id) ?? null,
      ocorrencias: (m) => ocorrenciasData.filter((o) => o.montagemId === m.id),
    },
    {
      status: "PENDENTE",
      pagoPelaLoja: false,
      pagoAoMontador: false,
      feitoPorAdm: false,
      percentualMontador: 0,
      valorMontador: 0,
      valorAssistencia: 0,
    }
  );
  notaPendente = new MockCollection<NotaPendente>(notasData, {
    montadorSugerido: (n) => usersData.find((u) => u.id === n.montadorSugeridoId) ?? null,
  });
  ocorrencia = new MockCollection<Ocorrencia>(ocorrenciasData);
  avaliacao = new MockCollection<Avaliacao>(avaliacoesData, {
    montagem: (a) => montagensData.find((m) => m.id === a.montagemId) ?? null,
    montador: (a) => usersData.find((u) => u.id === a.montadorId) ?? null,
  });
  orcamento = new MockCollection<Orcamento>(orcamentosData, {}, { status: "NOVO" });

  async $disconnect() {
    // nothing to do
  }

  async $transaction(operations: any[]) {
    // In a real mock, we would try to execute all or none, but for demo, sequentially is fine
    const results = [];
    for (const op of operations) {
      results.push(await op);
    }
    return results;
  }
}
