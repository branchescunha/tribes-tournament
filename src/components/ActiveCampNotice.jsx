import { Link } from 'react-router-dom'

export default function ActiveCampNotice({
  title = 'Nenhum acampamento ativo selecionado',
  message = 'Crie ou selecione um acampamento para gerenciar os dados operacionais.',
}) {
  return (
    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5">
      <h2 className="font-semibold text-yellow-100">{title}</h2>

      <p className="mt-2 text-sm text-yellow-100/90">{message}</p>

      <Link
        to="/admin/acampamentos"
        className="mt-4 inline-flex rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-400"
      >
        Ir para acampamentos
      </Link>
    </div>
  )
}
