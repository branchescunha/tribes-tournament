import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Ranking from './pages/Ranking'
import Login from './pages/Login'
import Admin from './pages/Admin'
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

        <Route path="/admin" element={<Admin />}>
          <Route index element={<Dashboard />} />
          <Route path="tribos" element={<Tribes />} />
          <Route path="participantes" element={<Participants />} />
          <Route path="pontuacao" element={<Scores />} />
          <Route path="historico" element={<History />} />
          <Route path="exportacao" element={<Export />} />
          <Route path="gincana" element={<Gymkhana />} />
          <Route path="inspecoes" element={<Inspections />} />
        </Route>

        <Route path="*" element={<Navigate to="/ranking" />} />
      </Routes>
    </BrowserRouter>
  )
}
