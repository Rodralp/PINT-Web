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
    <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm fixed-top main-navbar" style={{ height: '60px' }}>
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/SoftinsaLogo.png" alt="Softinsa Logo" height="35" className="d-inline-block align-text-center" />
        </a>
        
        <button className="navbar-toggler border-0 shadow-none ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse bg-white navbar-menu-panel" id="navbarContent">
          <div className="navbar-nav ms-auto mb-0 mb-md-0 d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 gap-md-4 mt-0 mt-md-0 px-0">
            <a href="https://www.softinsa.pt" className="nav-link text-dark fw-medium d-flex align-items-center gap-1 p-0" target="_blank" rel="noreferrer">
              <IconLink /> www.softinsa.pt
            </a>
            <a href="#galeria" className="nav-link text-dark fw-medium d-flex align-items-center gap-1 p-0">
              <IconSearch /> Galeria Pública
            </a>
            <button className="btn btn-primary rounded-pill px-4 fw-semibold border-0" style={{ backgroundColor: '#0088FF' }} onClick={() => navigate('/entrar')}>
              Entrar
            </button>
            <button className="btn btn-dark rounded-pill px-4 fw-semibold" onClick={() => navigate('/criar')}>
              Registar
            </button>
            <div className="nav-link text-dark fw-medium d-flex align-items-center gap-1 p-0" style={{ cursor: 'pointer' }}>
              Português <IconGlobe />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
