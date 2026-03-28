import './LandingPage.css';

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

function LandingPage() {
  return (
    <div className="lp-root">

      {/* NAVBAR */}
      <nav className="lp-navbar">
        <div className="lp-navbar-logo">
          <img src="/SoftinsaLogo.png" alt="Softinsa Logo" className="lp-logo-img" />
        </div>
        <div className="lp-navbar-links">
          <a href="https://www.softinsa.pt" className="lp-nav-link" target="_blank" rel="noreferrer">
            <IconLink /> www.softinsa.pt
          </a>
          <a href="#galeria" className="lp-nav-link">
            <IconSearch /> Galeria Pública
          </a>
          <button className="lp-btn lp-btn-entrar">Entrar</button>
          <button className="lp-btn lp-btn-registar">Registar</button>
          <div className="lp-lang">
            Português <IconGlobe />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="lp-info">
        <div className="lp-info-inner">
          <div className="lp-info-col">
            <h2 className="lp-info-title">Quem Somos?</h2>
            <p className="lp-info-lead">Especialistas em serviços de gestão aplicacional e de infraestruturas.</p>
            <p className="lp-info-body">
              O sucesso da Softinsa tem como base a inovação e a capacidade de nos reinventarmos continuamente.
            </p>
          </div>
          <div className="lp-info-col">
            <h2 className="lp-info-title">Serviços</h2>
            <p className="lp-info-lead">Soluções integradas e à medida do cliente.</p>
            <p className="lp-info-body">
              Procuramos satisfazer as necessidades de negócios dos nossos clientes.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-left">
            <h3 className="lp-footer-title">Vamos conversar?</h3>
            <a href="mailto:info@softinsa.pt" className="lp-footer-btn">
              Nos Envie Sua Mensagem →
            </a>
          </div>
          <div className="lp-footer-right">
            <a href="#softinsa" className="lp-footer-link">Softinsa</a>
            <a href="#privacidade" className="lp-footer-link">Política de Privacidade</a>
            <a href="#utilizacao" className="lp-footer-link">Condições de Utilização</a>
            <a href="#contactos" className="lp-footer-link">Contactos</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;