# CRM de Prospecção — Web Designers Freelancers

CRM leve e visual para organizar prospecção fria de leads (donos de site, clínicas,
advogados, infoprodutores etc.), controlar a cadência de mensagens (1ª, 2ª e 3ª mensagem),
priorizar oportunidades por potencial comercial, acompanhar a situação de cada negociação e
registrar clientes fechados com tipo de serviço e valor.

Não há disparo automático de mensagens — o envio é sempre manual (WhatsApp/Instagram/Email).
O CRM organiza, lembra a próxima ação e facilita copiar/abrir links rapidamente.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Prisma** + **Postgres** (hospedado no [Supabase](https://supabase.com))
- **Supabase Auth** para login (acesso único, protegido por middleware)
- **Papaparse** para importação/exportação de CSV
- Deploy na **Vercel**

## Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior (inclui `npm`)
- Uma conta no [Supabase](https://supabase.com) (banco de dados + login)
- Uma conta na [Vercel](https://vercel.com) (hospedagem)

## Configuração do Supabase

1. Crie um projeto no Supabase (ou use um existente).
2. Em **Project Settings → Database**, copie as duas connection strings (clique em "Connect"
   → aba "ORM" → Prisma): a de pooler (`Transaction`, porta 6543) vira o `DATABASE_URL`, e a
   direta (porta 5432) vira o `DIRECT_URL`.
3. Em **Project Settings → API**, copie o `Project URL` (`NEXT_PUBLIC_SUPABASE_URL`) e a
   `publishable key` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Em **Authentication → Users → Add user**, crie o seu próprio usuário (email + senha) —
   é esse login que dá acesso ao CRM. Não existe tela de cadastro público de propósito.

## Como rodar localmente

```bash
# 1. Entre na pasta do projeto
cd crm-prospeccao

# 2. Instale as dependências (isso já gera o Prisma Client automaticamente)
npm install

# 3. Copie .env.example para .env e preencha com os valores do seu projeto Supabase
cp .env.example .env

# 4. Aplique as migrações no banco Postgres do Supabase
npm run prisma:migrate

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000**, você vai cair na tela de login — entre com o usuário criado
no passo 4 da configuração do Supabase.

> Como o banco agora é hospedado no Supabase, rodar `npm run dev` localmente exige internet
> (não funciona mais 100% offline como na versão com SQLite).

## Deploy na Vercel

1. Suba o código para um repositório no GitHub.
2. Na Vercel, **Add New → Project** e importe esse repositório.
3. Antes do primeiro deploy, cole as 4 variáveis de ambiente (as mesmas do `.env` local:
   `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy. O build já roda `prisma migrate deploy` automaticamente antes do `next build`,
   então qualquer migração pendente é aplicada a cada novo deploy.

## Scripts disponíveis

| Comando                  | O que faz                                                |
| ------------------------ | --------------------------------------------------------|
| `npm run dev`             | Inicia o servidor de desenvolvimento                     |
| `npm run build`           | Aplica migrações pendentes e gera a build de produção    |
| `npm run start`           | Roda a build de produção (rode `build` antes)            |
| `npm run prisma:migrate`  | Cria/atualiza as tabelas do banco (Postgres)              |
| `npm run prisma:studio`   | Abre uma interface visual para ver/editar o banco direto  |
| `npm run db:seed`         | Popula o banco com leads de exemplo                       |

## Estrutura do projeto

```
prisma/
  schema.prisma        modelos Lead, Deal, TemplateMessage, ActivityLog
  seed.ts              leads de exemplo (opcional)
src/
  middleware.ts         protege páginas e API (redireciona/401 sem sessão)
  app/
    page.tsx            Dashboard
    login/              Tela de login (Supabase Auth)
    leads/               Tabela de leads (lista, filtros, busca, criar/editar)
    leads/[id]/          Página individual do lead (detalhes + histórico)
    kanban/              Visualização Kanban (drag-and-drop por situação)
    clientes/            Clientes fechados (tipo de serviço, valor, total por mês)
    templates/           Templates de mensagem
    api/                 Rotas de API (leads, deals, templates, dashboard, import/export)
  components/            Componentes reutilizáveis (badges, modais, tabela, kanban...)
  lib/                   Normalização de @/site/WhatsApp, cálculo de próxima ação,
                         métricas do dashboard, import/export CSV, clients Supabase
  types/                 Tipos e enums compartilhados
```

## Funcionalidades principais

- **Login único** (Supabase Auth) protegendo todas as páginas e rotas de API.
- **Cadastro de lead** com seções (dados do lead, análise comercial, mensagens, situação),
  incluindo o nome real da pessoa (usado para personalizar as mensagens geradas).
- **Normalização automática do @ do Instagram**: aceita `@user`, `user`,
  `instagram.com/user` ou `https://www.instagram.com/user/` — sempre salva o username limpo
  e gera o link clicável `https://instagram.com/user` (abre em nova aba).
- **Normalização de WhatsApp**: aceita `wa.me/...`, `api.whatsapp.com/send?phone=...` ou
  número puro com espaços/traços/parênteses.
- **Normalização de site**: aceita domínio com ou sem `https://`.
- **Gerador de 1ª mensagem**: monta um rascunho (conexão → observação estratégica →
  permissão) a partir do nicho, nome e análise do lead, sem usar IA nem enviar nada
  automaticamente.
- **Cadência de mensagens (1ª, 2ª, 3ª)**: cada uma com texto, data de envio, canal e botão de
  copiar. Os campos da 2ª e 3ª mensagem ficam destacados visualmente quando já passaram 2 dias
  desde a mensagem anterior e a próxima ainda não foi enviada.
- **Próxima ação automática**, calculada a partir das datas de envio e da situação do lead.
- **Dashboard** com totais, taxa de resposta, taxa de fechamento, leads por nicho/origem,
  últimos leads cadastrados etc.
- **Tabela de leads** (desktop) e **cards empilhados** (mobile), com filtros por situação,
  nicho, potencial, origem, canal e filtros rápidos (precisa 2ª/3ª mensagem, sem resposta,
  parados há +2 dias).
- **Kanban** com colunas por situação — arraste o card ou troque pelo seletor.
- **Clientes fechados**: registro de quem fechou, tipo de serviço e valor, vinculado ou não a
  um lead do funil, com total faturado por mês.
- **Templates de mensagem** reutilizáveis, com botão de copiar.
- **Importação/exportação de CSV**, com normalização automática e prevenção de duplicados
  (por @, site ou WhatsApp).
- **Histórico de atividade** por lead (criação, edições, mudança de situação, mensagens
  marcadas como enviadas etc.).
