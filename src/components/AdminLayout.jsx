import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function AdminLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

              <h1 className="mt-2 text-xl font-bold">Painel do evento</h1>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-300 shadow-lg"
            >
              <Menu size={24} />
            </button>
          </header>

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
