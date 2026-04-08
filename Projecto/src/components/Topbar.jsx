import { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, MoreVertical, Settings, Languages, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../css/Topbar.css';

function Topbar({ onToggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const storedLoginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');
  const loginData = storedLoginData ? JSON.parse(storedLoginData) : null;
  const userName = loginData?.nome || 'Usuário';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    // Remover dados de login de sessionStorage ou localStorage
    sessionStorage.removeItem('loginData');

    navigate('/');
  };

  return (
    <header className="topbar">
      <div className="topbar-logo d-flex align-items-center gap-2">
        <button 
          className="btn btn-light d-md-none border-0 shadow-none p-1 me-2" 
          onClick={onToggleSidebar}
        >
          <Menu size={24} strokeWidth={2} />
        </button>
        {/* Usando o mesmo logo da Navbar pública */}
        <img src="/SoftinsaLogo.png" alt="Softinsa Logo" className="topbar-logo-img" />
      </div>
      <div className="topbar-right">
        <button className="topbar-icon-btn">
          <Bell size={20} strokeWidth={2} />
        </button>
        <button className="topbar-icon-btn">
          <MessageSquare size={20} strokeWidth={2} />
        </button>
        <div className="topbar-user-info">
          <span className="topbar-user-name">{userName}</span>
          <img src={`https://i.pravatar.cc/150?u=${loginData?.nome}`} alt="User Avatar" className="topbar-avatar" />
        </div>
        
        <div className="topbar-dropdown-container" ref={dropdownRef}>
          <button 
            className="topbar-icon-btn topbar-more-btn" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <MoreVertical size={20} strokeWidth={2} />
          </button>
          
          {dropdownOpen && (
            <div className="topbar-dropdown-menu">
              <button className="topbar-dropdown-item">
                <Settings size={20} strokeWidth={2} />
                <span>Configuração</span>
              </button>
              <button className="topbar-dropdown-item">
                <Languages size={20} strokeWidth={2} />
                <span>Idioma</span>
              </button>
              <button className="topbar-dropdown-item" onClick={handleLogout}>
                <LogOut size={20} strokeWidth={2} />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
