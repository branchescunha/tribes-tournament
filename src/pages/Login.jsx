import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../hooks/useAuth'

const ADMIN_EMAIL = 'andrevinicius.bc@gmail.com'

export default function Login() {
  const { session, loadingAuth } = useAuthContext()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!password.trim()) {
      alert('Informe a senha de acesso.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    })

    if (error) {
      console.error(error)
      alert('Senha inválida.')
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
          Admin
        </p>

        <h1 className="mt-4 text-4xl font-bold leading-tight">
          Login Administrativo
        </h1>

        <p className="mt-4 text-zinc-400">
          Acesso restrito para a diretoria do Torneio das Tribos.
        </p>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha de acesso"
          className="mt-8 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 outline-none focus:border-yellow-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-yellow-500 px-4 py-4 font-semibold text-zinc-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <a
          href="/ranking"
          className="mt-6 block text-center text-sm text-zinc-400 hover:text-yellow-500"
        >
          Ver ranking público
        </a>
      </form>
    </main>
  )
}
