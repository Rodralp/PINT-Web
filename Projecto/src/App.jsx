import './css/App.css'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import './translations/i18n'
import LandingPage from './LandingPage'
import CriarConta from './criar'
import Entrar from './entrar'
import DashboardC from './pages/Consultor/Dashboard_C'
import DashboardTM from './pages/TalentManager/Dashboard_TM'
import DashboardSLL from './pages/ServiceLineLeader/Dashboard_SLL'
import DashboardAG from './pages/AdminGestor/Dashboard_AG'
import CatalogoBadges from './pages/CatalogoBadges/CatalogoBadges'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/criar' element={<CriarConta />} />
        <Route path='/entrar' element={<Entrar />} />
        <Route path='/dashboard' element={<Navigate to='/consultor/dashboard' replace />} />

        <Route path='/consultor/dashboard' element={<DashboardC />} />
        <Route path='/talent-manager/dashboard' element={<DashboardTM />} />
        <Route path='/service-line-leader/dashboard' element={<DashboardSLL />} />
        <Route path='/admin-gestor/dashboard' element={<DashboardAG />} />
        <Route path='/consultor/catalogo-badges' element={<CatalogoBadges />} />
        <Route path='/admin-gestor/catalogo-badges' element={<CatalogoBadges />} />

        <Route path='/dashboard/consultor' element={<Navigate to='/consultor/dashboard' replace />} />
        <Route path='/dashboard/talent-manager' element={<Navigate to='/talent-manager/dashboard' replace />} />
        <Route path='/dashboard/service-line-leader' element={<Navigate to='/service-line-leader/dashboard' replace />} />
        <Route path='/dashboard/admin-gestor' element={<Navigate to='/admin-gestor/dashboard' replace />} />
        <Route path='/dashboard/catalogo-badges' element={<Navigate to='/consultor/catalogo-badges' replace />} />
        <Route path='/dashboard/admin/catalogo-badges' element={<Navigate to='/admin-gestor/catalogo-badges' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
