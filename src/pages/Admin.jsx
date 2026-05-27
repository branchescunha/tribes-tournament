import { Navigate, Outlet } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useAuthContext } from '../hooks/useAuth'

export default function Admin() {
  const { session, loadingAuth } = useAuthContext()

  if (loadingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Verificando sessão...</p>
      </main>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
