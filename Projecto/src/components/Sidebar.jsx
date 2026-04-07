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
  ArrowDownToLine 
} from 'lucide-react';
import '../css/Sidebar.css';

const sidebarConfig = [
  {
    title: 'Consultor',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, isActive: true },
      { id: 'catalogo', label: 'Catálogo de Badges', icon: Medal },
      { id: 'meus_badges', label: 'Meus Badges', icon: Trophy },
      { id: 'learning_paths', label: 'Learning Paths', icon: BookOpen },
      { id: 'pedidos', label: 'Meus Pedidos', icon: Clock },
      { id: 'ranking', label: 'Ranking', icon: BarChart2 },
      { id: 'lembretes', label: 'Lembretes', icon: Pin },
      { id: 'exportacoes', label: 'Exportações', icon: ArrowDownToLine },
    ],
  },
  // Pode adicionar mais secções aqui facilmente no futuro
];

function Sidebar() {
  // Guardamos o estado das secções expandidas (por default todas abertas, ou apenas a primeira)
  const [expandedSections, setExpandedSections] = useState({
    'Consultor': true
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
          alt="João Gomes" 
          className="sidebar-avatar" 
        />
        <div className="sidebar-profile-info">
          <span className="sidebar-name">João Gomes</span>
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
