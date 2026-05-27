import { Link, useLocation } from 'react-router-dom'
import {
  ClipboardCheck,
  Swords,
  Download,
  History,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const links = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Tribos', path: '/admin/tribos', icon: Trophy },
  { label: 'Participantes', path: '/admin/participantes', icon: Users },
  { label: 'Pontuação', path: '/admin/pontuacao', icon: PlusCircle },
  { label: 'Gincana', path: '/admin/gincana', icon: Swords },
  { label: 'Inspeções', path: '/admin/inspecoes', icon: ClipboardCheck },
  { label: 'Histórico', path: '/admin/historico', icon: History },
  { label: 'Exportação', path: '/admin/exportacao', icon: Download },
]

export default function Sidebar({ isMenuOpen = false, onClose }) {
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-screen w-[85%] max-w-[320px] overflow-y-auto border-r border-zinc-800 bg-black p-5 transition-transform duration-300 lg:sticky lg:top-0 lg:min-h-screen lg:w-72 lg:translate-x-0 lg:bg-zinc-950 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
            Admin
          </p>

          <h1 className="mt-3 text-xl font-bold">O Torneio das Tribos</h1>

          <p className="mt-2 text-sm text-zinc-400">Painel de controle</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="mt-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.path

          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? 'bg-yellow-500 text-zinc-950'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 space-y-3">
        <Link
          to="/ranking"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
          <Trophy size={18} />
          Ver ranking público
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
