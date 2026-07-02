import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { useAuthContext } from '../hooks/useAuth'
import { useActiveCamp } from '../hooks/useActiveCamp'
import { supabase } from '../lib/supabase'
import { isValidSlug } from '../utils/slug'

export default function CampAdminRoute() {
  const { campSlug = '' } = useParams()
  const location = useLocation()
  const { session, loadingAuth } = useAuthContext()
  const { setActiveCamp } = useActiveCamp()
  const [loadingCamp, setLoadingCamp] = useState(true)
  const [camp, setCamp] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function loadCamp() {
      setLoadingCamp(true)
      setNotFound(false)

      if (!isValidSlug(campSlug)) {
        setCamp(null)
        setNotFound(true)
        setLoadingCamp(false)
        return
      }

      const { data, error } = await supabase
        .from('camps')
        .select('id, name, slug')
        .eq('slug', campSlug)
        .maybeSingle()

      if (error || !data) {
        if (error) console.error(error)
        setCamp(null)
        setNotFound(true)
        setLoadingCamp(false)
        return
      }

      setCamp(data)
      setActiveCamp(data)
      setLoadingCamp(false)
    }

    if (session) {
      loadCamp()
    }
  }, [campSlug, session, setActiveCamp])

  if (loadingAuth || (session && loadingCamp)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Carregando painel do acampamento...</p>
      </main>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (notFound || !camp) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 text-white">
        <section className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
            AcampGestor
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            Acampamento não encontrado
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Acampamento não encontrado ou você não tem permissão para
            acessá-lo.
          </p>

          <Link
            to="/admin/acampamentos"
            className="mt-6 inline-flex rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-400"
          >
            Ir para meus acampamentos
          </Link>
        </section>
      </main>
    )
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
