import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../hooks/useAuth'

const ADMIN_EMAIL = 'andrevinicius.bc@gmail.com'

export default function Login() {
  const { session, loadingAuth } = useAuthContext()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    if (!password.trim()) {
      setError('Informe a senha de acesso.')
      return
    }

    setLoading(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    })

    if (loginError) {
      console.error(loginError)
      setError('Senha inválida.')
      setLoading(false)
      return
    }

    setLoading(false)
  }

  if (loadingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Verificando sessão...</p>
      </main>
    )
  }

  if (session) {
    return <Navigate to="/admin" replace />
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
          Painel administrativo
        </h1>

        <p className="mt-4 text-zinc-400">
          Acesse o painel administrativo do seu evento.
        </p>

        <label htmlFor="admin-password" className="sr-only">
          Senha de acesso
        </label>

        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha de acesso"
          className="mt-8 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 outline-none focus:border-yellow-500"
        />

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-yellow-500 px-4 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <Link
          to="/recuperar-senha"
          className="mt-5 block text-center text-sm text-zinc-400 hover:text-yellow-500"
        >
          Esqueci minha senha
        </Link>

        <Link
          to="/ranking"
          className="mt-6 block text-center text-sm text-zinc-400 hover:text-yellow-500"
        >
          Ver ranking do evento
        </Link>
      </form>
    </main>
  )
}
