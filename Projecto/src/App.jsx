import './css/App.css'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import './translations/i18n'
import LandingPage from './LandingPage'
import GaleriaPublica from './GaleriaPublica'
import BadgePublica from './BadgePublica'
import PerfilPublico from './PerfilPublico'
import CriarConta from './criar'
import Entrar from './entrar'
import DashboardC from './pages/Consultor/Dashboard_C'
import DashboardTM from './pages/TalentManager/Dashboard_TM'
import GestaoPedidosTM from './pages/TalentManager/GestaoPedidos_TM'
import PedidoTM from './pages/TalentManager/Pedido_TM'
import ExportacoesTM from './pages/TalentManager/Exportacoes_TM'
import DashboardSLL from './pages/ServiceLineLeader/Dashboard_SLL'
import ExportacoesSLL from './pages/ServiceLineLeader/Exportacoes_SLL'
import GestaoPedidosSLL from './pages/ServiceLineLeader/GestaoPedidos_SLL'
import PedidoSLL from './pages/ServiceLineLeader/Pedido_SLL'
import RankingSLL from './pages/ServiceLineLeader/Ranking_SLL'
import DashboardAG from './pages/AdminGestor/Dashboard_AG'
import CatalogoBadges from './pages/CatalogoBadges'
import GestaoPedidosAG from './pages/AdminGestor/GestaoPedidos_AG'
import PedidoAG from './pages/AdminGestor/Pedido_AG'
import MeusBadges from './pages/Consultor/MeusBadges'
import BadgeDetalhe from './pages/Consultor/BadgeDetalhe'
import PedidoDetalheC from './pages/Consultor/PedidoDetalhe_C'
import Exportacoes from './pages/Consultor/Exportacoes'
import MensagensAvisos from './pages/Consultor/MensagensAvisos'
import Notificacoes from './pages/Consultor/Notificacoes'
import Profile from './pages/profile'
import MeusPedidos from './pages/Consultor/MeusPedidos'
import RankingConsultores from './pages/Consultor/RankingConsultores'
import Lembretes from './pages/Consultor/Lembretes'
import LearningPaths from './pages/Consultor/LearningPaths'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/galeria-publica' element={<GaleriaPublica />} />
        <Route path='/galeria-publica/badge/:badgeId' element={<BadgePublica />} />
        <Route path='/galeria-publica/consultor/:consultorId' element={<PerfilPublico />} />
        <Route path='/criar' element={<CriarConta />} />
        <Route path='/entrar' element={<Entrar />} />
        <Route path='/dashboard' element={<Navigate to='/consultor/dashboard' replace />} />
        <Route path='/profile' element={<Profile />} />

        <Route path='/consultor/dashboard' element={<DashboardC />} />
        <Route path='/consultor/catalogo-badges' element={<CatalogoBadges />} />
        <Route path='/consultor/meus-badges' element={<MeusBadges />} />
        <Route path='/consultor/badge/:badgeId' element={<BadgeDetalhe />} />
        <Route path='/consultor/learning-paths' element={<LearningPaths />} />
        <Route path='/consultor/meus-pedidos' element={<MeusPedidos />} />
        <Route path='/consultor/meus-pedidos/:pedidoId' element={<PedidoDetalheC />} />
        <Route path='/consultor/ranking' element={<RankingConsultores />} />
        <Route path='/consultor/lembretes' element={<Lembretes />} />
        <Route path='/consultor/exportacoes' element={<Exportacoes />} />
        <Route path='/consultor/mensagens-avisos' element={<MensagensAvisos />} />
        <Route path='/consultor/notificacoes' element={<Notificacoes />} />

        <Route path='/talent-manager/dashboard' element={<DashboardTM />} />
        <Route path='/talent-manager/pedidos' element={<GestaoPedidosTM />} />
        <Route path='/talent-manager/pedidos/:pedidoId' element={<PedidoTM />} />
        <Route path='/talent-manager/exportacoes' element={<ExportacoesTM />} />

        <Route path='/service-line-leader/dashboard' element={<DashboardSLL />} />
        <Route path='/service-line-leader/ranking' element={<RankingSLL />} />
        <Route path='/service-line-leader/pedidos' element={<GestaoPedidosSLL />} />
        <Route path='/service-line-leader/pedidos/:pedidoId' element={<PedidoSLL />} />
        <Route path='/service-line-leader/exportacoes' element={<ExportacoesSLL />} />

        <Route path='/admin-gestor/dashboard' element={<DashboardAG />} />
        <Route path='/admin-gestor/catalogo-badges' element={<CatalogoBadges />} />
        <Route path='/admin-gestor/pedidos' element={<GestaoPedidosAG />} />
        <Route path='/admin-gestor/pedidos/:pedidoId' element={<PedidoAG />} />



        <Route path='/dashboard/consultor' element={<Navigate to='/consultor/dashboard' replace />} />
        <Route path='/dashboard/catalogo-badges' element={<Navigate to='/consultor/catalogo-badges' replace />} />
        <Route path='/dashboard/meus-badges' element={<Navigate to='/consultor/meus-badges' replace />} />
        <Route path='/dashboard/badge/:badgeId' element={<BadgeDetalhe />} />
        <Route path='/dashboard/learning-paths' element={<Navigate to='/consultor/learning-paths' replace />} />
        <Route path='/dashboard/meus-pedidos' element={<Navigate to='/consultor/meus-pedidos' replace />} />
        <Route path='/dashboard/meus-pedidos/:pedidoId' element={<PedidoDetalheC />} />
        <Route path='/dashboard/ranking' element={<Navigate to='/consultor/ranking' replace />} />
        <Route path='/dashboard/lembretes' element={<Navigate to='/consultor/lembretes' replace />} />
        <Route path='/dashboard/exportacoes' element={<Navigate to='/consultor/exportacoes' replace />} />
        <Route path='/dashboard/mensagens-avisos' element={<Navigate to='/consultor/mensagens-avisos' replace />} />
        <Route path='/dashboard/notificacoes' element={<Navigate to='/consultor/notificacoes' replace />} />

        <Route path='/dashboard/talent-manager' element={<Navigate to='/talent-manager/dashboard' replace />} />
        <Route path='/dashboard/talent-manager/pedidos' element={<Navigate to='/talent-manager/pedidos' replace />} />
        <Route path='/dashboard/talent-manager/pedidos/:pedidoId' element={<Navigate to='/talent-manager/pedidos' replace />} />
        <Route path='/dashboard/talent-manager/exportacoes' element={<Navigate to='/talent-manager/exportacoes' replace />} />

        <Route path='/dashboard/service-line-leader' element={<Navigate to='/service-line-leader/dashboard' replace />} />
        <Route path='/dashboard/service-line-leader/ranking' element={<Navigate to='/service-line-leader/ranking' replace />} />
        <Route path='/dashboard/service-line-leader/pedidos' element={<Navigate to='/service-line-leader/pedidos' replace />} />
        <Route path='/dashboard/service-line-leader/pedidos/:pedidoId' element={<Navigate to='/service-line-leader/pedidos' replace />} />
        <Route path='/dashboard/service-line-leader/exportacoes' element={<Navigate to='/service-line-leader/exportacoes' replace />} />
        
        <Route path='/dashboard/admin-gestor' element={<Navigate to='/admin-gestor/dashboard' replace />} />
        <Route path='/dashboard/admin-gestor/pedidos' element={<Navigate to='/admin-gestor/pedidos' replace />} />
        <Route path='/dashboard/admin-gestor/pedidos/:pedidoId' element={<Navigate to='/admin-gestor/pedidos' replace />} />
        <Route path='/dashboard/admin/pedidos' element={<Navigate to='/admin-gestor/pedidos' replace />} />
        <Route path='/dashboard/admin/catalogo-badges' element={<Navigate to='/admin-gestor/catalogo-badges' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App