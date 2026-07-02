import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import {
  getCampNameStorageKey,
  getCampSlugStorageKey,
  useActiveCamp,
} from '../hooks/useActiveCamp'

export default function AdminLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { campSlug } = useParams()
  const { activeCampId } = useActiveCamp()
  const activeCampName = activeCampId
    ? window.localStorage.getItem(getCampNameStorageKey(activeCampId))
    : ''
  const activeCampSlug = activeCampId
    ? window.localStorage.getItem(getCampSlugStorageKey(activeCampId))
    : ''
  const isCampAdminRoute = Boolean(campSlug)

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex">
        <Sidebar isMenuOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        <section className="min-h-screen flex-1 p-5 lg:p-8">
          <header className="mb-8 flex items-center justify-between lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
                Admin
              </p>

              <h1 className="mt-2 text-xl font-bold">
                {isCampAdminRoute
                  ? 'Painel do acampamento'
                  : 'Área administrativa'}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menu"
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-300 shadow-lg"
            >
              <Menu size={24} />
            </button>
          </header>

          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-sm text-zinc-300">
            {activeCampName ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {isCampAdminRoute
                    ? 'Painel do acampamento: '
                    : 'Acampamento ativo: '}
                  <strong className="text-white">{activeCampName}</strong>
                </span>

                {!isCampAdminRoute && activeCampSlug && (
                  <Link
                    to={`/${activeCampSlug}/admin`}
                    className="font-semibold text-yellow-400 hover:text-yellow-300"
                  >
                    Abrir painel por URL própria
                  </Link>
                )}
              </div>
            ) : (
              <span>
                Nenhum acampamento ativo selecionado.{' '}
                <Link
                  to="/admin/acampamentos"
                  className="font-semibold text-yellow-400 hover:text-yellow-300"
                >
                  Criar ou selecionar acampamento
                </Link>
              </span>
            )}
          </div>

          {children}
        </section>
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </main>
  )
}
