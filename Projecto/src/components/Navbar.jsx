import { useNavigate } from 'react-router-dom';
import '../css/Navbar.css';

const IconLink = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconGlobe = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="lp-navbar">
      <div className="lp-navbar-logo" onClick={() => navigate('/')}>
        <img src="/SoftinsaLogo.png" alt="Softinsa Logo" className="lp-logo-img" />
      </div>
      <div className="lp-navbar-links">
        <a href="https://www.softinsa.pt" className="lp-nav-link" target="_blank" rel="noreferrer">
          <IconLink /> www.softinsa.pt
        </a>
        <a href="#galeria" className="lp-nav-link">
          <IconSearch /> Galeria Pública
        </a>
        <button className="lp-btn lp-btn-entrar" onClick={() => navigate('/entrar')}>Entrar</button>
        <button className="lp-btn lp-btn-registar" onClick={() => navigate('/criar')}>Registar</button>
        <div className="lp-lang">
          Português <IconGlobe />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
