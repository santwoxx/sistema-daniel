import { User, Loja, ComissaoLoja, Montagem, NotaPendente, Ocorrencia, Avaliacao, Orcamento } from "./types";

// Banco mock começa vazio de propósito — sem usuários, lojas, montagens ou
// orçamentos de exemplo. O administrador entra pelo Google (a conta é
// criada automaticamente no primeiro login autorizado) e cadastra o resto
// pelo próprio painel.
export const usersData: User[] = [];
export const lojasData: Loja[] = [];
export const comissoesData: ComissaoLoja[] = [];
export const montagensData: Montagem[] = [];
export const notasData: NotaPendente[] = [];
export const ocorrenciasData: Ocorrencia[] = [];
export const avaliacoesData: Avaliacao[] = [];
export const orcamentosData: Orcamento[] = [];
