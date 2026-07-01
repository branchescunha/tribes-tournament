import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Ranking from './pages/Ranking'
import PublicCampRanking from './pages/PublicCampRanking'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import RequestAccess from './pages/RequestAccess'
import Admin from './pages/Admin'
import Account from './pages/Account'
import AccessRequests from './pages/AccessRequests'
import Camps from './pages/Camps'
import Dashboard from './pages/Dashboard'
import Tribes from './pages/Tribes'
import Participants from './pages/Participants'
import Scores from './pages/Scores'
import History from './pages/History'
import Export from './pages/Export'
import Gymkhana from './pages/Gymkhana'
import Inspections from './pages/Inspections'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/ranking" />} />

        <Route path="/ranking" element={<Ranking />} />

        <Route path="/login" element={<Login />} />

        <Route path="/solicitar-acesso" element={<RequestAccess />} />

        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route
          path="/forgot-password"
          element={<Navigate to="/recuperar-senha" replace />}
        />

        <Route path="/redefinir-senha" element={<ResetPassword />} />
        <Route
          path="/reset-password"
          element={<Navigate to="/redefinir-senha" replace />}
        />

        <Route path="/admin" element={<Admin />}>
          <Route index element={<Dashboard />} />
          <Route path="conta" element={<Account />} />
          <Route path="solicitacoes" element={<AccessRequests />} />
          <Route path="acampamentos" element={<Camps />} />
          <Route
            path="account"
            element={<Navigate to="/admin/conta" replace />}
          />
          <Route path="tribos" element={<Tribes />} />
          <Route path="participantes" element={<Participants />} />
          <Route path="pontuacao" element={<Scores />} />
          <Route path="historico" element={<History />} />
          <Route path="exportacao" element={<Export />} />
          <Route path="gincana" element={<Gymkhana />} />
          <Route path="inspecoes" element={<Inspections />} />
        </Route>

        <Route path="/:campSlug" element={<PublicCampRanking />} />

        <Route path="*" element={<Navigate to="/ranking" />} />
      </Routes>
    </BrowserRouter>
  )
}
