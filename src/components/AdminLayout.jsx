import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { getCampNameStorageKey, useActiveCamp } from '../hooks/useActiveCamp'

export default function AdminLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { activeCampId } = useActiveCamp()
  const activeCampName = activeCampId
    ? window.localStorage.getItem(getCampNameStorageKey(activeCampId))
    : ''

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
                Painel do acampamento
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
              <span>
                Acampamento ativo:{' '}
                <strong className="text-white">{activeCampName}</strong>
              </span>
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
