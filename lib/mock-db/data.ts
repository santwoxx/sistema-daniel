import { Role, StatusMontagem, TipoOcorrencia, User, Loja, ComissaoLoja, Montagem, NotaPendente, Ocorrencia, Avaliacao, Orcamento } from "./types";

// Hash bcrypt real da senha "demo1234" — só para os usuários de demonstração
// abaixo (mock db local), para o login por e-mail/senha funcionar de
// verdade nesta prévia. Numa implantação de produção (Postgres via Prisma),
// as senhas de verdade são geradas pelo cadastro do admin, nunca fixas aqui.
const SENHA_DEMO_HASH = "$2b$10$VT7z8nCB0gV.ljhMVHvbVeIGkRmipj8sWxozQXDx8.hmEi4aYFssm";

export const usersData: User[] = [
  {
    id: "admin-1",
    nome: "Administrador",
    email: "admin@aguia.com",
    telefone: "11999999999",
    fotoUrl: null,
    senha: SENHA_DEMO_HASH,
    role: "ADMIN",
    ativo: true,
    comissaoPadrao: 0,
    createdAt: new Date(),
    _count: { montagens: 0 },
  },
  {
    id: "montador-1",
    nome: "João Montador",
    email: "joao@aguia.com",
    telefone: "11988888888",
    fotoUrl: null,
    senha: SENHA_DEMO_HASH,
    role: "MONTADOR",
    ativo: true,
    comissaoPadrao: 10,
    createdAt: new Date(),
    _count: { montagens: 2 },
  },
  {
    id: "montador-2",
    nome: "Maria Montadora",
    email: "maria@aguia.com",
    telefone: "11977777777",
    fotoUrl: null,
    senha: SENHA_DEMO_HASH,
    role: "MONTADOR",
    ativo: true,
    comissaoPadrao: 12,
    createdAt: new Date(),
    _count: { montagens: 0 },
  }
];

export const lojasData: Loja[] = [
  {
    id: "loja-1",
    nome: "Loja de Móveis Centro",
    telefone: "1133333333",
    endereco: "Rua do Centro, 123",
    cnpj: "12345678000199",
    ativo: true,
    createdAt: new Date(),
    _count: { montagens: 1 },
  },
  {
    id: "loja-2",
    nome: "Magazine Moveleiro",
    telefone: "1144444444",
    endereco: "Av Brasil, 1000",
    cnpj: "98765432000188",
    ativo: true,
    createdAt: new Date(),
    _count: { montagens: 1 },
  }
];

export const comissoesData: ComissaoLoja[] = [
  {
    id: "com-1",
    montadorId: "montador-1",
    lojaId: "loja-1",
    percentual: 10,
  },
  {
    id: "com-2",
    montadorId: "montador-1",
    lojaId: "loja-2",
    percentual: 15,
  }
];

export const montagensData: Montagem[] = [
  {
    id: "mont-1",
    numeroPedido: "PED-1001",
    lojaId: "loja-1",
    montadorId: "montador-1",
    clienteNome: "Carlos Silva",
    clienteTelefone: "11966666666",
    clienteEndereco: "Rua das Flores, 45",
    descricaoServico: "Montagem de Guarda-roupa 6 portas",
    valorServico: 150.0,
    percentualMontador: 10,
    valorMontador: 15.0,
    valorAssistencia: 0,
    feitoPorAdm: false,
    dataAgendada: new Date(Date.now() + 86400000), // tomorrow
    status: "PENDENTE",
    pagoPelaLoja: false,
    pagoAoMontador: false,
    observacoes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    concluidoEm: null,
    fotoProdutoUrl: null,
    assinaturaMontador: null,
    assinaturaCliente: null,
    manualUrl: null,
    manualNomeArquivo: null,
    manualTipo: null,
    notificadoCentralSyncEm: null,
    avaliacaoSolicitadaEm: null,
    loja: lojasData[0],
    montador: usersData[1],
    avaliacao: null,
    ocorrencias: [],
    _count: { ocorrencias: 0 },
  },
  {
    id: "mont-2",
    numeroPedido: "PED-1002",
    lojaId: "loja-2",
    montadorId: "montador-1",
    clienteNome: "Ana Souza",
    clienteTelefone: "11955555555",
    clienteEndereco: "Av Paulista, 200",
    descricaoServico: "Montagem de Mesa de Jantar",
    valorServico: 80.0,
    percentualMontador: 15,
    valorMontador: 12.0,
    valorAssistencia: 0,
    feitoPorAdm: false,
    dataAgendada: new Date(Date.now() - 86400000), // yesterday
    status: "CONCLUIDO",
    pagoPelaLoja: true,
    pagoAoMontador: false,
    observacoes: "Tudo certo",
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(),
    concluidoEm: new Date(),
    fotoProdutoUrl: null,
    assinaturaMontador: null,
    assinaturaCliente: null,
    manualUrl: null,
    manualNomeArquivo: null,
    manualTipo: null,
    notificadoCentralSyncEm: null,
    avaliacaoSolicitadaEm: null,
    loja: lojasData[1],
    montador: usersData[1],
    avaliacao: null,
    ocorrencias: [],
    _count: { ocorrencias: 0 },
  }
];

export const notasData: NotaPendente[] = [];
export const ocorrenciasData: Ocorrencia[] = [];
export const avaliacoesData: Avaliacao[] = [];

export const orcamentosData: Orcamento[] = [
  {
    id: "orc-1",
    nome: "Fernanda Lima",
    telefone: "11991234567",
    descricao: "Guarda-roupa casal 6 portas, comprei no fim de semana e preciso montar essa semana.",
    fotoUrl: null,
    status: "NOVO",
    observacoesAdmin: null,
    criadoEm: new Date(Date.now() - 3 * 3600 * 1000),
  },
  {
    id: "orc-2",
    nome: "Ricardo Nogueira",
    telefone: "11987654321",
    descricao: "Cozinha planejada, 4 módulos.",
    fotoUrl: null,
    status: "CONTATADO",
    observacoesAdmin: "Falei no WhatsApp, aguardando ele confirmar a data.",
    criadoEm: new Date(Date.now() - 26 * 3600 * 1000),
  },
];
