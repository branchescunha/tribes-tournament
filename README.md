# AcampGestor

Sistema web para gestão de acampamentos de igrejas, com equipes, participantes, pontuações, gincanas, inspeções, ranking e exportação de dados.

Produção: https://tribes-tournament.vercel.app

## Funcionalidades

- Ranking público das equipes.
- Painel administrativo protegido por autenticação.
- Solicitação controlada de acesso administrativo.
- Revisão administrativa de solicitações de acesso.
- Recuperação e redefinição de senha.
- Cadastro e edição de equipes.
- Cadastro e filtragem de participantes.
- Registro de pontos e penalidades.
- Histórico de lançamentos.
- Controle de gincanas.
- Controle de inspeções de quartos.
- Exportação completa dos dados em Excel.
- Interface responsiva para celular e notebook.

## Tecnologias Utilizadas

- React
- Vite
- Tailwind CSS
- Supabase
- React Router
- Lucide React
- ExcelJS

## Rotas Principais

- `/ranking`: ranking público do acampamento.
- `/login`: acesso ao painel administrativo.
- `/solicitar-acesso`: solicitação controlada de acesso administrativo.
- `/recuperar-senha`: solicitação de recuperação de senha.
- `/redefinir-senha`: criação de nova senha via Supabase Auth.
- `/admin`: dashboard administrativo.
- `/admin/conta`: configurações da conta.
- `/admin/acampamentos`: gestão dos acampamentos do usuário.
- `/admin/solicitacoes`: revisão de solicitações de acesso.
- `/admin/tribos`: gestão de equipes.
- `/admin/participantes`: gestão de participantes.
- `/admin/pontuacao`: lançamentos de pontos e penalidades.
- `/admin/historico`: histórico de lançamentos.
- `/admin/gincana`: controle da gincana.
- `/admin/inspecoes`: controle de inspeções.
- `/admin/exportacao`: exportação dos dados.

As rotas antigas `/forgot-password`, `/reset-password` e `/admin/account` continuam disponíveis apenas como compatibilidade e redirecionam para as rotas em português.

## Autenticação

O login usa e-mail e senha do Supabase Auth.

O cadastro aberto ainda não existe neste MVP. A rota `/solicitar-acesso` salva pedidos de acesso na tabela `access_requests`, mas não cria usuário automaticamente.

Usuários administrativos ainda devem ser criados manualmente no Supabase Auth. A aprovação de uma solicitação em `/admin/solicitacoes` apenas marca o pedido como aprovado para controle interno.

A recuperação de senha começa em `/recuperar-senha` e a redefinição acontece em `/redefinir-senha`.

## Banco de Dados

Para habilitar as solicitações de acesso reais, execute manualmente no Supabase SQL Editor o arquivo:

```text
supabase/sql/001_create_access_requests.sql
```

Esse script cria a tabela `access_requests`, ativa RLS e define policies para:

- visitantes anônimos criarem solicitações pendentes;
- visitantes anônimos não listarem solicitações;
- usuários autenticados listarem solicitações;
- usuários autenticados revisarem solicitações.

Para habilitar a gestão de acampamentos, execute manualmente no Supabase SQL Editor o arquivo:

```text
supabase/sql/002_create_camps.sql
```

Esse script cria a tabela `camps`, ativa RLS e permite que cada usuário autenticado crie, liste e edite apenas os próprios acampamentos.

Nesta versão, o acampamento ativo é salvo localmente no navegador com a chave `acampgestor.activeCampId`. A seleção já aparece no layout administrativo e no dashboard, mas equipes, participantes, pontuações, ranking, gincanas, inspeções e exportação ainda não são filtrados por acampamento.

Para vincular os dados operacionais ao acampamento ativo, execute manualmente no Supabase SQL Editor o arquivo:

```text
supabase/sql/003_add_camp_id_to_operational_tables.sql
```

Esse script adiciona `camp_id` nullable em `tribes`, `participants`, `score_events`, `gymkhana_events`, `gymkhana_settings` e `room_inspections`, além de criar índices para consulta por acampamento.

Dados antigos com `camp_id` vazio não são exibidos quando há um acampamento ativo selecionado. O próprio arquivo SQL inclui uma orientação comentada para migração manual segura desses dados.

## Variáveis de Ambiente

O projeto depende de variáveis de ambiente para conexão com o Supabase.

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Valores reais de ambiente não devem ser versionados no Git.

## Deploy

Plataforma recomendada: Vercel.

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

O projeto inclui `vercel.json` com fallback para `index.html`, necessário para rotas client-side após refresh ou acesso direto.

Configure no Supabase Auth as URLs de redirecionamento:

Local:

- `http://localhost:4000`
- `http://localhost:4000/redefinir-senha`
- `http://localhost:4000/**`

Produção:

- `https://tribes-tournament.vercel.app`
- `https://tribes-tournament.vercel.app/redefinir-senha`
- `https://tribes-tournament.vercel.app/**`

## Status do Projeto

MVP funcional em evolução.

O AcampGestor já cobre o fluxo principal de gestão de acampamentos, pontuação, ranking, administração, solicitações de acesso, seleção de acampamento ativo e exportação. Próximas evoluções devem tratar a vinculação dos dados operacionais ao acampamento ativo, personalização por evento, identidade visual configurável e suporte mais avançado para uso por outras igrejas.

## Observações Técnicas

- O build de produção passa, mas o Vite ainda alerta que alguns chunks passam de 500 kB.
- O `npm audit` pode reportar 2 vulnerabilidades moderadas em `uuid` via `exceljs`.
- A correção automática dessas vulnerabilidades exige `npm audit fix --force` e alteração insegura/downgrade do `exceljs`; por isso, foi aceita temporariamente.
- A rota `/admin/tribos` foi mantida por compatibilidade técnica, embora a comunicação visível use "equipes".

## Estrutura do Projeto

```text
src/
  components/   Componentes reutilizáveis da interface
  data/         Dados iniciais e apoios locais
  domain/       Regras puras de ranking e pontuação
  hooks/        Hooks compartilhados
  lib/          Configuração de integrações
  pages/        Telas principais da aplicação

supabase/
  sql/          Scripts SQL para configuração manual no Supabase
```

## Autor

André Vinícius
