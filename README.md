# TribeScore

Sistema web para organizar pontuações, tribos/equipes, participantes, rankings, gincanas e inspeções em eventos de igrejas.

Produção: https://tribes-tournament.vercel.app

## Funcionalidades

- Ranking público das tribos.
- Painel administrativo protegido por autenticação.
- Recuperação e redefinição de senha.
- Cadastro e edição de tribos.
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

- `/ranking`: ranking público do evento.
- `/login`: acesso ao painel administrativo.
- `/recuperar-senha`: solicitação de recuperação de senha.
- `/redefinir-senha`: criação de nova senha via Supabase Auth.
- `/admin`: dashboard administrativo.
- `/admin/conta`: configurações da conta.
- `/admin/tribos`: gestão de tribos.
- `/admin/participantes`: gestão de participantes.
- `/admin/pontuacao`: lançamentos de pontos e penalidades.
- `/admin/historico`: histórico de lançamentos.
- `/admin/gincana`: controle da gincana.
- `/admin/inspecoes`: controle de inspeções.
- `/admin/exportacao`: exportação dos dados.

As rotas antigas `/forgot-password`, `/reset-password` e `/admin/account` continuam disponíveis apenas como compatibilidade e redirecionam para as rotas em português.

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

O TribeScore já cobre o fluxo principal de pontuação, ranking, administração e exportação. Próximas evoluções devem tratar personalização por evento, identidade visual configurável e suporte mais avançado para uso por outras igrejas.

## Observações Técnicas

- O build de produção passa, mas o Vite ainda alerta que alguns chunks passam de 500 kB.
- O `npm audit` pode reportar 2 vulnerabilidades moderadas em `uuid` via `exceljs`.
- A correção automática dessas vulnerabilidades exige `npm audit fix --force` e alteração insegura/downgrade do `exceljs`; por isso, foi aceita temporariamente.

## Estrutura do Projeto

```text
src/
  components/   Componentes reutilizáveis da interface
  data/         Dados iniciais e apoios locais
  domain/       Regras puras de ranking e pontuação
  hooks/        Hooks compartilhados
  lib/          Configuração de integrações
  pages/        Telas principais da aplicação
```

## Autor

André Vinícius
