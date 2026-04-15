import { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, MoreVertical, Settings, Languages, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/Topbar.css';

function Topbar({ onToggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const storedLoginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');
  const loginData = storedLoginData ? JSON.parse(storedLoginData) : null;
  const userName = loginData?.nome || t('app_user_default');

  const languages = [
    { code: 'pt', label: t('lang_portuguese'), flag: '/flags/pt.svg' },
    { code: 'en', label: t('lang_english'), flag: '/flags/gb.svg' },
    { code: 'es', label: t('lang_spanish'), flag: '/flags/es.svg' },
  ];

  const currentLanguage = languages.find(({ code }) => i18n.language?.startsWith(code)) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setShowLanguageMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    // Remover dados de login de sessionStorage e localStorage
    sessionStorage.removeItem('loginData');
    localStorage.removeItem('loginData');

    navigate('/');
  };

  function handleProfileClick() {
    navigate('/profile');
  }

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setShowLanguageMenu(false);
    setDropdownOpen(false);
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
        <div className="topbar-user-info" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
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
                <span>{t('topbar_settings')}</span>
              </button>
              <button className="topbar-dropdown-item" onClick={() => setShowLanguageMenu((prev) => !prev)}>
                <Languages size={20} strokeWidth={2} />
                <span>{t('topbar_language')}</span>
                <span className="topbar-language-current">{currentLanguage.label}</span>
              </button>
              {showLanguageMenu && (
                <div className="topbar-language-list">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      className={`topbar-language-option ${i18n.language?.startsWith(language.code) ? 'active' : ''}`}
                      onClick={() => handleLanguageChange(language.code)}
                    >
                      <img src={language.flag} alt={language.label} className="topbar-language-flag" />
                      <span>{language.label}</span>
                    </button>
                  ))}
                </div>
              )}
              <button className="topbar-dropdown-item" onClick={handleLogout}>
                <LogOut size={20} strokeWidth={2} />
                <span>{t('topbar_logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
