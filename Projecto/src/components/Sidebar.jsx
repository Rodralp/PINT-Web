import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  History,
  CircleUserRound,
  UsersRound,
  Megaphone,
  Settings,
  Crown
} from 'lucide-react';
import '../css/Sidebar.css';

const sidebarConfig = [
  {
    title: 'Consultor',
    items: [
      { id: 'dashboard_C', label: 'Dashboard', icon: Home, route: '/consultor/dashboard' },
      { id: 'catalogo_C', label: 'Catálogo de Badges', icon: Medal, route: '/consultor/catalogo-badges' },
      { id: 'meus_badges_C', label: 'Meus Badges', icon: Trophy, route: '/consultor/meus-badges' },
      { id: 'learning_paths_C', label: 'Learning Paths', icon: BookOpen },
      { id: 'pedidos_C', label: 'Meus Pedidos', icon: Clock },
      { id: 'ranking_C', label: 'Ranking', icon: Crown },
      { id: 'lembretes_C', label: 'Lembretes', icon: Pin },
      { id: 'exportacoes_C', label: 'Exportações', icon: ArrowDownToLine },
    ],
  },
  {
    title: 'Talent Manager',
    items: [
      { id: 'dashboard_TM', label: 'Dashboard', icon: Home, route: '/talent-manager/dashboard' },
      { id: 'pedidos_TM', label: 'Gestão de Pedidos', icon: FilePenLine },
      { id: 'historico_TM', label: 'Histórico', icon: History },
      { id: 'exportacoes_TM', label: 'Exportações TM', icon: ArrowDownToLine },
    ],
  },
  {
    title: 'Service Line Leader',
    items: [
      { id: 'dashboard_SLL', label: 'Dashboard', icon: Home, route: '/service-line-leader/dashboard' },
      { id: 'learning_paths_SLL', label: 'Meu Learning Path', icon: BookOpen },
      { id: 'ranking_SLL', label: 'Ranking da Service Line', icon: Crown },
      { id: 'pedidos_SLL', label: 'Gestão de Pedidos', icon: FilePenLine },
      { id: 'historico_SLL', label: 'Histórico', icon: History },
      { id: 'exportacoes_SLL', label: 'Exportações SLL', icon: ArrowDownToLine },
    ],
  },
  {
    title: 'Administrador / Gestor',
    items: [
      { id: 'dashboard_AG', label: 'Dashboard', icon: Home, route: '/admin-gestor/dashboard' },
      { id: 'utilizadores_AG', label: 'Utilizadores', icon: CircleUserRound },
      { id: 'catalogo_AG', label: 'Catálogo de Badges', icon: Medal, route: '/admin-gestor/catalogo-badges' },
      { id: 'equipas_AG', label: 'Equipas e SLA', icon: UsersRound },
      { id: 'comunicados_AG', label: 'Comunicados e Avisos', icon: Megaphone },
      { id: 'pedidos_AG', label: 'Gestão de Pedidos', icon: FilePenLine },
      { id: 'exportacoes_AG', label: 'Exportações Admin', icon: ArrowDownToLine },
      { id: 'gestao_AG', label: 'Gestão Geral', icon: Settings },
    ],
  },
];

function Sidebar() {
  const location = useLocation();
  const storedLoginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');
  const loginData = storedLoginData ? JSON.parse(storedLoginData) : null;
  const userName = loginData?.nome || 'Usuário';
  const getInitialExpandedSections = () => {
    const initialState = {
      'Consultor': true,
      'Talent Manager': false,
      'Service Line Leader': false,
      'Administrador / Gestor': false
    };

    const matchedSection = sidebarConfig.find((section) =>
      section.items.some((item) => item.route === location.pathname)
    );

    if (matchedSection) {
      return {
        'Consultor': false,
        'Talent Manager': false,
        'Service Line Leader': false,
        'Administrador / Gestor': false,
        [matchedSection.title]: true,
      };
    }

    return initialState;
  };

  const [expandedSections, setExpandedSections] = useState(getInitialExpandedSections);

  useEffect(() => {
    const matchedSection = sidebarConfig.find((section) =>
      section.items.some((item) => item.route === location.pathname)
    );

    if (!matchedSection) {
      return;
    }

    setExpandedSections((prev) => ({
      ...prev,
      [matchedSection.title]: true,
    }));
  }, [location.pathname]);

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
          src={`https://i.pravatar.cc/150?u=${loginData?.nome}`} 
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
                        {item.route ? (
                          <NavLink
                            to={item.route}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                          >
                            <Icon size={20} strokeWidth={2} className="sidebar-link-icon" />
                            <span className="sidebar-link-label">{item.label}</span>
                          </NavLink>
                        ) : (
                          <a
                            href={`#${item.id}`}
                            className="sidebar-link"
                          >
                            <Icon size={20} strokeWidth={2} className="sidebar-link-icon" />
                            <span className="sidebar-link-label">{item.label}</span>
                          </a>
                        )}
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
