import { useState } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  Home,
  Medal,
  Trophy,
  BookOpen,
  Clock,
  BarChart2,
  Pin,
  ArrowDownToLine,
  FilePenLine,
  History
} from 'lucide-react';
import '../css/Sidebar.css';

const sidebarConfig = [
  {
    title: 'Consultor',
    items: [
      { id: 'dashboard_C', label: 'Dashboard', icon: Home, isActive: true },
      { id: 'catalogo_C', label: 'Catálogo de Badges', icon: Medal },
      { id: 'meus_badges_C', label: 'Meus Badges', icon: Trophy },
      { id: 'learning_paths_C', label: 'Learning Paths', icon: BookOpen },
      { id: 'pedidos_C', label: 'Meus Pedidos', icon: Clock },
      { id: 'ranking_C', label: 'Ranking', icon: BarChart2 },
      { id: 'lembretes_C', label: 'Lembretes', icon: Pin },
      { id: 'exportacoes_C', label: 'Exportações', icon: ArrowDownToLine },
    ],
  },
  {
    title: 'Talent Manager',
    items: [
      { id: 'dashboard_TM', label: 'Dashboard', icon: Home },
      { id: 'pedidos_TM', label: 'Gestão de Pedidos', icon: FilePenLine },
      { id: 'historico_TM', label: 'Histórico', icon: History },
      { id: 'exportacoes_TM', label: 'Exportações TM', icon: ArrowDownToLine },
    ],
  },
  {
    title: 'Service Line Leader',
    items: [
      { id: 'dashboard_SLL', label: 'Dashboard', icon: Home },
      { id: 'learning_paths_SLL', label: 'Meu Learning Path', icon: BookOpen },
      { id: 'ranking_SLL', label: 'Ranking da Service Line', icon: BarChart2 },
      { id: 'pedidos_SLL', label: 'Gestão de Pedidos', icon: FilePenLine },
      { id: 'historico_SLL', label: 'Histórico', icon: History },
      { id: 'exportacoes_SLL', label: 'Exportações SLL', icon: ArrowDownToLine },
    ],
  },
  {
    title: 'Administrador / Gestor',
    items: [
      { id: 'dashboard_AG', label: 'Dashboard', icon: Home },
      { id: 'catalogo_AG', label: 'Catálogo de Badges', icon: Medal },
      { id: 'learning_paths_AG', label: 'Meu Learning Path', icon: BookOpen },
      { id: 'ranking_AG', label: 'Ranking da Service Line', icon: BarChart2 },
      { id: 'pedidos_AG', label: 'Gestão de Pedidos', icon: FilePenLine },
      { id: 'historico_AG', label: 'Histórico', icon: History },
      { id: 'exportacoes_AG', label: 'Exportações AG', icon: ArrowDownToLine },
    ],
  },
  // Pode adicionar mais secções aqui facilmente no futuro
];

function Sidebar() {
  const storedLoginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');
  const loginData = storedLoginData ? JSON.parse(storedLoginData) : null;
  const userName = loginData?.nome || 'Usuário';
  // Guardamos o estado das secções expandidas (por default todas abertas, ou apenas a primeira)
  const [expandedSections, setExpandedSections] = useState({
    'Consultor': true,
    'Talent Manager': false,
    'Service Line Leader': false,
    'Administrador / Gestor': false
  });

  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <img 
          src="https://i.pravatar.cc/150?u=a042581f4e29026704f" 
          alt="Usuário" 
          className="sidebar-avatar" 
        />
        <div className="sidebar-profile-info">
          <span className="sidebar-name">{userName}</span>
          <span className="sidebar-points">2450 pontos</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sidebarConfig.map((section, idx) => {
          const isExpanded = expandedSections[section.title];

          return (
            <div key={idx} className="sidebar-section">
              <button 
                className="sidebar-section-header"
                onClick={() => toggleSection(section.title)}
              >
                <span className="sidebar-section-title">{section.title}</span>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isExpanded && (
                <ul className="sidebar-menu">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id} className="sidebar-menu-item">
                        <a 
                          href={`#${item.id}`} 
                          className={`sidebar-link ${item.isActive ? 'active' : ''}`}
                        >
                          <Icon size={20} strokeWidth={2} className="sidebar-link-icon" />
                          <span className="sidebar-link-label">{item.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
