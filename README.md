# CRM de Prospecção — Web Designers Freelancers

CRM local, leve e visual para organizar prospecção fria de leads (donos de site, clínicas,
advogados, infoprodutores etc.), controlar a cadência de mensagens (1ª, 2ª e 3ª mensagem),
priorizar oportunidades por potencial comercial e acompanhar a situação de cada negociação.

Não há disparo automático de mensagens — o envio é sempre manual (WhatsApp/Instagram/Email).
O CRM organiza, lembra a próxima ação e facilita copiar/abrir links rapidamente.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Prisma** + **SQLite** (banco de dados local, um único arquivo `.db`)
- **Papaparse** para importação/exportação de CSV

Tudo roda 100% local, sem depender de serviços pagos ou externos.

## Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior (inclui `npm`)

## Como rodar localmente

```bash
# 1. Entre na pasta do projeto
cd crm-prospeccao

# 2. Instale as dependências (isso já gera o Prisma Client automaticamente)
npm install

# 3. Confirme que existe um arquivo .env com a variável DATABASE_URL
#    (o projeto já vem com um .env apontando para prisma/dev.db)

# 4. Crie o banco de dados SQLite e as tabelas
npm run prisma:migrate

# 5. (Opcional) Popule o banco com alguns leads de exemplo
npm run db:seed

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000** no navegador.

## Scripts disponíveis

| Comando                  | O que faz                                              |
| ------------------------ | -------------------------------------------------------|
| `npm run dev`             | Inicia o servidor de desenvolvimento                    |
| `npm run build`           | Gera a build de produção                                |
| `npm run start`           | Roda a build de produção (rode `build` antes)           |
| `npm run prisma:migrate`  | Cria/atualiza as tabelas do banco (SQLite)               |
| `npm run prisma:studio`   | Abre uma interface visual para ver/editar o banco direto |
| `npm run db:seed`         | Popula o banco com leads de exemplo                      |

## Estrutura do projeto

```
prisma/
  schema.prisma        modelos Lead, TemplateMessage, ActivityLog
  seed.ts              leads de exemplo (opcional)
src/
  app/
    page.tsx            Dashboard
    leads/               Tabela de leads (lista, filtros, busca, criar/editar)
    leads/[id]/          Página individual do lead (detalhes + histórico)
    kanban/              Visualização Kanban (drag-and-drop por situação)
    templates/           Templates de mensagem
    api/                 Rotas de API (leads, templates, dashboard, import/export)
  components/            Componentes reutilizáveis (badges, modais, tabela, kanban...)
  lib/                   Normalização de @/site/WhatsApp, cálculo de próxima ação,
                         métricas do dashboard, import/export CSV
  types/                 Tipos e enums compartilhados
```

## Funcionalidades principais

- **Cadastro de lead** com seções (dados do lead, análise comercial, mensagens, situação).
- **Normalização automática do @ do Instagram**: aceita `@user`, `user`,
  `instagram.com/user` ou `https://www.instagram.com/user/` — sempre salva o username limpo
  e gera o link clicável `https://instagram.com/user` (abre em nova aba).
- **Normalização de WhatsApp**: aceita `wa.me/...`, `api.whatsapp.com/send?phone=...` ou
  número puro com espaços/traços/parênteses.
- **Normalização de site**: aceita domínio com ou sem `https://`.
- **Cadência de mensagens (1ª, 2ª, 3ª)**: cada uma com texto, data de envio, canal e botão de
  copiar. Os campos da 2ª e 3ª mensagem ficam destacados visualmente quando já passaram 2 dias
  desde a mensagem anterior e a próxima ainda não foi enviada.
- **Próxima ação automática**, calculada a partir das datas de envio e da situação do lead.
- **Dashboard** com totais, taxa de resposta, taxa de fechamento, leads por nicho/origem etc.
- **Tabela de leads** (desktop) e **cards empilhados** (mobile), com filtros por situação,
  nicho, potencial, origem, canal e filtros rápidos (precisa 2ª/3ª mensagem, sem resposta,
  parados há +2 dias).
- **Kanban** com colunas por situação — arraste o card ou troque pelo seletor.
- **Templates de mensagem** reutilizáveis, com botão de copiar.
- **Importação/exportação de CSV**, com normalização automática e prevenção de duplicados
  (por @, site ou WhatsApp).
- **Histórico de atividade** por lead (criação, edições, mudança de situação, mensagens
  marcadas como enviadas etc.).

## Sobre hospedagem

Este CRM foi feito para rodar **na sua própria máquina**, sem custo de hospedagem — o banco
de dados é um arquivo SQLite local (`prisma/dev.db`). Basta `npm run dev` sempre que quiser
usar. Se um dia quiser acessar de qualquer lugar, seria necessário trocar o SQLite por um
banco hospedado (ex.: Turso/LibSQL ou Postgres) e publicar em algum serviço — não é necessário
para o uso local do dia a dia.
