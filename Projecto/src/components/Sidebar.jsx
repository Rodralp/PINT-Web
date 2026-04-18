import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    titleKey: 'sidebar_section_consultor',
    allowedRoles: ['consultor'],
    items: [
      { id: 'dashboard_C', labelKey: 'sidebar_dashboard', icon: Home, route: '/consultor/dashboard' },
      { id: 'catalogo_C', labelKey: 'sidebar_catalog_badges', icon: Medal, route: '/consultor/catalogo-badges' },
      { id: 'meus_badges_C', labelKey: 'sidebar_my_badges', icon: Trophy, route: '/consultor/meus-badges' },
      { id: 'learning_paths_C', labelKey: 'sidebar_learning_paths', icon: BookOpen },
      { id: 'pedidos_C', labelKey: 'sidebar_my_requests', icon: Clock, route: '/consultor/meus-pedidos' },
      { id: 'ranking_C', labelKey: 'sidebar_ranking', icon: Crown, route: '/consultor/ranking' },
      { id: 'lembretes_C', labelKey: 'sidebar_reminders', icon: Pin, route: '/consultor/lembretes' },
      { id: 'exportacoes_C', labelKey: 'sidebar_exports', icon: ArrowDownToLine, route: '/consultor/exportacoes' },
    ],
  },
  {
    title: 'Talent Manager',
    titleKey: 'sidebar_section_tm',
    allowedRoles: ['talent-manager'],
    items: [
      { id: 'dashboard_TM', labelKey: 'sidebar_dashboard', icon: Home, route: '/talent-manager/dashboard' },
      { id: 'pedidos_TM', labelKey: 'sidebar_manage_requests', icon: FilePenLine, route: '/talent-manager/pedidos' },
      { id: 'historico_TM', labelKey: 'sidebar_history', icon: History },
      { id: 'exportacoes_TM', labelKey: 'sidebar_exports_tm', icon: ArrowDownToLine, route: '/talent-manager/exportacoes' },
    ],
  },
  {
    title: 'Service Line Leader',
    titleKey: 'sidebar_section_sll',
    allowedRoles: ['service-line-leader'],
    items: [
      { id: 'dashboard_SLL', labelKey: 'sidebar_dashboard', icon: Home, route: '/service-line-leader/dashboard' },
      { id: 'learning_paths_SLL', labelKey: 'sidebar_my_learning_path', icon: BookOpen },
      { id: 'ranking_SLL', labelKey: 'sidebar_service_line_ranking', icon: Crown },
      { id: 'pedidos_SLL', labelKey: 'sidebar_manage_requests', icon: FilePenLine },
      { id: 'historico_SLL', labelKey: 'sidebar_history', icon: History },
      { id: 'exportacoes_SLL', labelKey: 'sidebar_exports_sll', icon: ArrowDownToLine },
    ],
  },
  {
    title: 'Administrador / Gestor',
    titleKey: 'sidebar_section_admin',
    allowedRoles: ['admin-gestor'],
    items: [
      { id: 'dashboard_AG', labelKey: 'sidebar_dashboard', icon: Home, route: '/admin-gestor/dashboard' },
      { id: 'utilizadores_AG', labelKey: 'sidebar_users', icon: CircleUserRound },
      { id: 'catalogo_AG', labelKey: 'sidebar_catalog_badges', icon: Medal, route: '/admin-gestor/catalogo-badges' },
      { id: 'equipas_AG', labelKey: 'sidebar_teams_sla', icon: UsersRound },
      { id: 'comunicados_AG', labelKey: 'sidebar_announcements', icon: Megaphone },
      { id: 'pedidos_AG', labelKey: 'sidebar_manage_requests', icon: FilePenLine },
      { id: 'exportacoes_AG', labelKey: 'sidebar_exports_admin', icon: ArrowDownToLine },
      { id: 'gestao_AG', labelKey: 'sidebar_general_management', icon: Settings },
    ],
  },
];

const DEFAULT_ROLE = 'consultor';

const getStoredLoginData = () => {
  const storedLoginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');

  if (!storedLoginData) {
    return null;
  }

  try {
    return JSON.parse(storedLoginData);
  } catch {
    return null;
  }
};

const normalizeRoles = (rolesValue) => {
  const rawRoles = Array.isArray(rolesValue)
    ? rolesValue
    : typeof rolesValue === 'string'
      ? rolesValue.split(';')
      : [];

  const parsedRoles = rawRoles
    .map((role) => String(role).trim().toLowerCase())
    .filter(Boolean);

  const uniqueRoles = [...new Set(parsedRoles)];
  return uniqueRoles.length > 0 ? uniqueRoles : [DEFAULT_ROLE];
};

function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const loginData = getStoredLoginData();
  const userRoles = normalizeRoles(loginData?.roles ?? loginData?.role);
  const filteredSections = sidebarConfig.filter((section) =>
    section.allowedRoles.some((role) => userRoles.includes(role))
  );
  const visibleSidebarSections = filteredSections.length > 0
    ? filteredSections
    : sidebarConfig.filter((section) => section.allowedRoles.includes(DEFAULT_ROLE));
  const userName = loginData?.nome || t('app_user_default');
  const matchedSectionTitle =
    visibleSidebarSections.find((section) =>
      section.items.some((item) => item.route === location.pathname)
    )?.title || null;

  const buildSectionState = (expandedSectionTitle = null) => {
    const nextState = {};

    visibleSidebarSections.forEach((section, index) => {
      nextState[section.title] = expandedSectionTitle
        ? section.title === expandedSectionTitle
        : index === 0;
    });

    return nextState;
  };

  const getInitialExpandedSections = () => {
    const matchedSection = visibleSidebarSections.find((section) =>
      section.items.some((item) => item.route === location.pathname)
    );

    if (matchedSection) {
      return buildSectionState(matchedSection.title);
    }

    return buildSectionState();
  };

  const [expandedSections, setExpandedSections] = useState(getInitialExpandedSections);

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
          <span className="sidebar-points">2450 {t('app_points_suffix')}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleSidebarSections.map((section, idx) => {
          const isExpanded = section.title === matchedSectionTitle
            ? true
            : expandedSections[section.title];

          return (
            <div key={idx} className="sidebar-section">
              <button 
                className="sidebar-section-header"
                onClick={() => toggleSection(section.title)}
              >
                <span className="sidebar-section-title">{t(section.titleKey)}</span>
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
                            <span className="sidebar-link-label">{t(item.labelKey)}</span>
                          </NavLink>
                        ) : (
                          <a
                            href={`#${item.id}`}
                            className="sidebar-link"
                          >
                            <Icon size={20} strokeWidth={2} className="sidebar-link-icon" />
                            <span className="sidebar-link-label">{t(item.labelKey)}</span>
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
