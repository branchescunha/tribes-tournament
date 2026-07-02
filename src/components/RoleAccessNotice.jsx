import { Link } from 'react-router-dom'

export default function RoleAccessNotice({
  title = 'Acesso indisponível',
  message,
  actionPath = '/admin/acampamentos',
  actionLabel = 'Ir para acampamentos',
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
        AcampGestor
      </p>

      <h1 className="mt-4 text-3xl font-bold">{title}</h1>

      {message && (
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
          {message}
        </p>
      )}

      {actionPath && (
        <Link
          to={actionPath}
          className="mt-6 inline-flex rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-400"
        >
          {actionLabel}
        </Link>
      )}
    </section>
  )
}
