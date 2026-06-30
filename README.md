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

## Roadmap inicial

- Limpeza e organização do repositório.
- Centralização das regras de ranking e pontuação.
- Melhorias de UI, UX, responsividade e acessibilidade.
- Preparação para personalização de eventos, equipes, cores e identidade visual.
- Evolução futura para múltiplos eventos, autenticação mais completa e uso avançado do Supabase.
