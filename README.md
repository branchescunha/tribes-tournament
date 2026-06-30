# TribeScore

Sistema web para organizar pontuações, tribos, equipes, participantes e rankings em eventos de igrejas.

## Objetivo

O TribeScore está sendo desenvolvido para apoiar a organização de acampamentos, retiros, congressos, gincanas e outros eventos em que grupos precisam registrar pontos, penalidades e rankings de forma clara.

A proposta é transformar o projeto em uma aplicação profissional, reutilizável e preparada para que outras igrejas possam adaptar o sistema aos seus próprios eventos no futuro.

## Funcionalidades atuais

- Ranking público das tribos.
- Painel administrativo protegido por autenticação.
- Cadastro e edição de tribos.
- Cadastro e filtragem de participantes.
- Registro de pontos e penalidades.
- Histórico de lançamentos.
- Controle de gincanas.
- Controle de inspeções de quartos.
- Exportação completa dos dados em Excel.
- Interface responsiva para uso em celular e notebook.

## Tecnologias utilizadas

- React
- Vite
- Tailwind CSS
- Supabase
- React Router
- Lucide React
- ExcelJS

## Status do projeto

Em evolução.

Esta versão já possui funcionalidades operacionais, mas ainda está sendo organizada para se tornar um produto mais reutilizável, documentado e adequado para uso por diferentes igrejas.

## Variáveis de ambiente

O projeto depende de variáveis de ambiente para conexão com o Supabase.

Crie um arquivo `.env` local com base no arquivo `.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Valores reais de ambiente não devem ser versionados no Git.

## Configuração do Supabase Auth

Para que a recuperação de senha funcione corretamente, configure as URLs de redirecionamento no Supabase Dashboard.

Ambiente local:

- `http://localhost:4000`
- `http://localhost:4000/reset-password`
- `http://localhost:4000/**`

Produção:

- `https://dominio-do-deploy.com`
- `https://dominio-do-deploy.com/reset-password`
- `https://dominio-do-deploy.com/**`

## Deploy do MVP

A plataforma recomendada para o deploy inicial é a Vercel.

Configuração do projeto:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Variáveis de ambiente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Configure as variáveis diretamente na plataforma de deploy. Não versionar `.env` nem valores reais de credenciais.

Para rotas client-side como `/login`, `/forgot-password`, `/reset-password`, `/admin`, `/admin/account` e `/ranking`, o projeto inclui `vercel.json` com fallback para `index.html`.

Antes de publicar, confirme no Supabase Auth as URLs de redirecionamento do ambiente de produção:

- `https://URL_DO_DEPLOY`
- `https://URL_DO_DEPLOY/reset-password`
- `https://URL_DO_DEPLOY/**`

O `npm audit` ainda pode reportar vulnerabilidades moderadas de `uuid` via `exceljs`. Essa correção exige `npm audit fix --force` com mudança insegura de versão do `exceljs`, então deve ser tratada em etapa própria.

## Roadmap inicial

- Limpeza e organização do repositório.
- Centralização das regras de ranking e pontuação.
- Melhorias de UI, UX, responsividade e acessibilidade.
- Preparação para personalização de eventos, equipes, cores e identidade visual.
- Evolução futura para múltiplos eventos, autenticação mais completa e uso avançado do Supabase.
