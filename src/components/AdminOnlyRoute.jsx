import { Navigate } from 'react-router-dom'
import RoleAccessNotice from './RoleAccessNotice'
import { useUserProfile } from '../hooks/useUserProfile'

export default function AdminOnlyRoute({ children, redirectGestorTo = '' }) {
  const { profile, isAdmin, isGestor, isActive, loading, error } =
    useUserProfile()

  if (loading) {
    return <p className="text-zinc-400">Verificando perfil de acesso...</p>
  }

  if (error) {
    return (
      <RoleAccessNotice
        title="Perfil indisponível"
        message={error}
        actionPath=""
      />
    )
  }

  if (!profile) {
    return (
      <RoleAccessNotice
        title="Perfil de acesso não encontrado"
        message="Seu usuário ainda não possui um perfil de acesso. Entre em contato com o administrador da plataforma."
        actionPath=""
      />
    )
  }

  if (!isActive) {
    return (
      <RoleAccessNotice
        title="Acesso suspenso"
        message="Seu acesso está suspenso. Entre em contato com o administrador da plataforma."
        actionPath=""
      />
    )
  }

  if (isAdmin) return children

  if (isGestor && redirectGestorTo) {
    return <Navigate to={redirectGestorTo} replace />
  }

  return (
    <RoleAccessNotice
      title="Acesso negado"
      message="Você não tem permissão para acessar esta área."
    />
  )
}
