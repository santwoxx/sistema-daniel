# MontaFácil — Sistema de gestão para montadores de móveis

Sistema simples para organizar as demandas (montagens) e as finanças de uma
empresa de montagem de móveis, com um painel para o administrador e um painel
individual para cada montador.

> **Base personalizável.** Este repositório não tem nenhuma marca, empresa ou
> dado real embutido — toda a identidade visual (nome, cores, textos) e a
> integração com Firebase/banco de dados vêm de configuração (veja
> `.env.example`), e `npm run db:seed` popula o sistema com uma equipe,
> lojas e montagens de demonstração fictícias, prontas para apresentar. Use
> como ponto de partida para uma implantação nova por cliente.

## O que o sistema faz

**Painel do administrador**
- Cadastra e gerencia os montadores da equipe (cria login e senha de cada um).
- Cadastra as lojas parceiras que enviam pedidos.
- Define a porcentagem de comissão de cada montador, individualmente por loja.
- Cria e atribui montagens a um montador específico (ou deixa "a definir").
- Importa uma nota fiscal para preencher uma montagem nova sozinho: aceita o
  XML da NFe ou uma foto/imagem da nota impressa (a leitura da foto é feita
  por OCR direto no navegador, sem custo). Se a loja da nota ainda não
  estiver cadastrada, o sistema cadastra ela automaticamente.
- Acompanha o status de cada montagem (pendente, em andamento, concluída).
- Controla os pagamentos: se a loja já pagou a empresa e se o montador já
  recebeu sua comissão.
- Tem uma tela financeira com totais por mês, por loja e por montador.
- Recebe pedidos de orçamento enviados por clientes (tela `/admin/orcamentos`):
  nome, telefone e, se o cliente enviar, uma foto do móvel. Cada pedido pode
  ser marcado como contatado/convertido/recusado, e um botão leva os dados
  direto para o cadastro de uma nova montagem.

**Link público de orçamento**
- `/orcamento` é uma página sem login que qualquer cliente pode acessar (ex:
  compartilhada no WhatsApp, Instagram ou no cartão da empresa) para pedir um
  orçamento: nome, telefone, uma descrição opcional do que precisa montar e
  uma foto opcional do móvel. O pedido cai direto na fila do admin acima.

**Painel do montador**
- Vê apenas as montagens atribuídas a ele.
- Ao abrir uma montagem, vê o endereço do cliente (com link direto para o
  mapa), telefone (com botão de ligar e de WhatsApp), o serviço a ser feito
  e o valor da sua comissão.
- Pode marcar a montagem como "iniciada" e depois "concluída".
- Tem uma tela financeira própria mostrando quanto já ganhou, quanto está
  pendente de pagamento e o histórico de montagens concluídas.

## Como rodar o sistema no seu computador

Pré-requisitos:
- [Node.js](https://nodejs.org) instalado (versão 18 ou superior).
- Um banco de dados Postgres na nuvem (gratuito). Recomendado: crie uma conta
  em [neon.com](https://neon.com), crie um projeto e copie as duas strings de
  conexão (pooled e direct) para o arquivo `.env` do projeto, nas variáveis
  `DATABASE_URL` e `DIRECT_URL`.

```bash
cd sistema-montador
npm install                       # instala as dependências (só precisa fazer uma vez)
npx prisma migrate deploy         # cria as tabelas no banco (só precisa fazer uma vez)
npm run db:seed                   # cria o usuário administrador padrão
npm run dev                        # inicia o sistema
```

Depois abra **http://localhost:3000** no navegador.

### Primeiro acesso

- **Administrador:** entra **só** pelo botão "Entrar com Google" — e-mail e
  senha são recusados para contas com esse papel, mesmo que a conta tenha
  uma senha cadastrada. Só funciona para e-mails autorizados (veja a seção
  do Firebase abaixo); sem isso configurado, ninguém consegue entrar como
  administrador.
- **Montador/colaborador:** entra com e-mail e senha, cadastrados pelo
  administrador no painel — nunca pelo Google.

A partir daí, use o painel para cadastrar lojas, montadores e comissões — tudo
pela própria interface, sem precisar mexer em código.

## Login do administrador com Google (Firebase) — opcional

O login por e-mail e senha (cadastrado pelo administrador no painel) sempre
funciona, com ou sem Firebase configurado. O botão "Entrar com Google" é um
atalho extra para o administrador: sem as variáveis `NEXT_PUBLIC_FIREBASE_*`
no `.env`, ele aparece desativado e o resto do sistema funciona normalmente.

O token do Google é sempre conferido no servidor (assinatura, validade e
e-mail verificado) antes de qualquer acesso ser liberado. Quem decide **quais
contas** podem entrar são as regras de segurança do Firestore
(`firestore.rules` deste projeto) — não uma lista dentro do código. O
servidor confirma a autorização chamando a própria API do Firestore com o
token da pessoa; se a regra permitir a leitura, o acesso é liberado. Não é
necessário o SDK Admin do Firebase nem uma credencial de conta de serviço.

Para ativar, cada implantação precisa do **seu próprio** projeto Firebase
(gratuito) — passo a passo no [console do
Firebase](https://console.firebase.google.com):

1. **Criar o projeto e um app Web:** crie um projeto novo, adicione um app
   Web a ele e copie os valores de `firebaseConfig` (apiKey, authDomain,
   projectId, storageBucket, messagingSenderId, appId) para as variáveis
   `NEXT_PUBLIC_FIREBASE_*` do seu `.env` (veja `.env.example`).
2. **Ativar o login com Google:** Authentication → Sign-in method → ative o
   provedor "Google".
3. **Criar o banco Firestore:** Firestore Database → Criar banco de dados
   (qualquer região, modo produção).
4. **Publicar as regras:** na aba "Regras", cole o conteúdo do arquivo
   [`firestore.rules`](firestore.rules) deste projeto e clique em
   **"Publicar"** (só colar o texto no editor não ativa nada).
5. **Autorizar o primeiro administrador:** na aba "Dados", crie a coleção
   `adminEmails` com um documento cujo **ID é o e-mail da conta Google da
   pessoa, em minúsculas** (ex: `dono@gmail.com`) — não precisa de nenhum
   campo dentro, só o documento existir. Para autorizar mais alguém depois,
   ou remover o acesso de alguém, é só criar/apagar o documento
   correspondente — sem editar nem publicar a regra de novo.
6. **Domínios autorizados:** em Authentication → Settings → Authorized
   domains, `localhost` já vem liberado. Depois do deploy, adicione o
   domínio do Vercel (ex: `seusistema.vercel.app`) nessa lista, senão o
   login com Google não funciona em produção.

Quem não tiver um documento correspondente em `adminEmails` tem o login com
Google recusado — mesmo com uma conta Google válida.

## Integração com sistema externo (opcional)

Se você já tem outro sistema (ex: um app de pedidos/entregas) e quer que
pedidos designados por lá cheguem aqui automaticamente como "notas
pendentes" (em vez de importar manualmente por XML/foto), configure as
variáveis `EXTERNAL_INTEGRATION_*` do `.env.example`. Sem elas, essa
integração fica desativada e o cadastro manual de montagens continua
funcionando normalmente — não é um recurso necessário para usar o sistema.

### Se precisar recriar o usuário administrador

Se apagar o banco de dados ou quiser recriar o admin padrão:

```bash
npm run db:seed
```

## Sobre o banco de dados

Os dados ficam guardados num banco Postgres na nuvem (ex: Neon), não em um
arquivo local — assim o mesmo banco funciona tanto no seu computador quanto
no site publicado no Vercel. Para visualizar/editar os dados diretamente (uma
planilha visual), rode:

```bash
npx prisma studio
```

**Importante:** o provedor do banco (Neon, Supabase, etc.) já cuida de
backups automáticos, mas vale a pena checar as opções de backup do provedor
escolhido — é lá que fica todo o histórico financeiro da empresa.

## Publicando o sistema no Vercel

Com o banco Postgres já configurado no `.env`, o deploy é feito subindo este
projeto (pasta `sistema-montador`) para o Vercel — pela CLI (`vercel`) ou
conectando um repositório do GitHub. As mesmas variáveis `DATABASE_URL`,
`DIRECT_URL` e `SESSION_SECRET` do `.env` precisam ser cadastradas nas
"Environment Variables" do projeto no Vercel. Depois disso, o link gerado
(ex: `seusistema.vercel.app`) já funciona tanto para o admin quanto para os
montadores, em qualquer dispositivo com internet.

## Estrutura do projeto (para referência técnica)

- `prisma/schema.prisma` — modelo do banco de dados (usuários, lojas,
  comissões, montagens).
- `lib/auth.ts` — login, sessão e proteção de acesso por papel (admin/montador).
- `lib/actions/` — as ações do sistema (criar montador, criar montagem,
  marcar pagamento, etc).
- `app/admin/` — todas as telas do painel do administrador.
- `app/montador/` — todas as telas do painel do montador.
- `components/` — componentes visuais reutilizados nas telas.
