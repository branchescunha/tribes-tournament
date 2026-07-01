import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function RequestAccess() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Informe seu nome.')
      return
    }

    if (!email.trim()) {
      setError('Informe seu e-mail.')
      return
    }

    if (!organization.trim()) {
      setError('Informe sua igreja ou organização.')
      return
    }

    setSuccess(
      'Solicitação registrada localmente. Entre em contato com a organização responsável pelo evento para concluir a criação da conta.',
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
          TribeScore
        </p>

        <h1 className="mt-4 text-4xl font-bold leading-tight">
          Solicitar acesso
        </h1>

        <p className="mt-4 text-zinc-400">
          O TribeScore utiliza cadastro administrativo controlado. Envie seus
          dados para que a organização responsável pelo evento possa avaliar a
          criação da sua conta.
        </p>

        <label
          htmlFor="request-name"
          className="mt-8 block text-sm font-medium text-zinc-300"
        >
          Nome
        </label>

        <input
          id="request-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Seu nome"
          autoComplete="name"
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 outline-none focus:border-yellow-500"
        />

        <label
          htmlFor="request-email"
          className="mt-5 block text-sm font-medium text-zinc-300"
        >
          E-mail
        </label>

        <input
          id="request-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="seu-email@exemplo.com"
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 outline-none focus:border-yellow-500"
        />

        <label
          htmlFor="request-organization"
          className="mt-5 block text-sm font-medium text-zinc-300"
        >
          Igreja/organização
        </label>

        <input
          id="request-organization"
          type="text"
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          placeholder="Nome da igreja ou organização"
          autoComplete="organization"
          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 outline-none focus:border-yellow-500"
        />

        <label
          htmlFor="request-message"
          className="mt-5 block text-sm font-medium text-zinc-300"
        >
          Mensagem, opcional
        </label>

        <textarea
          id="request-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Informe o evento ou contexto do acesso"
          rows={4}
          className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 outline-none focus:border-yellow-500"
        />

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            {success}
          </p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-yellow-500 px-4 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-400"
        >
          Enviar solicitação
        </button>

        <Link
          to="/login"
          className="mt-6 block text-center text-sm text-zinc-400 hover:text-yellow-500"
        >
          Voltar para o login
        </Link>

        <Link
          to="/ranking"
          className="mt-4 block text-center text-sm text-zinc-400 hover:text-yellow-500"
        >
          Ver ranking público
        </Link>
      </form>
    </main>
  )
}
