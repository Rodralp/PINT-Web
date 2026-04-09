import Navbar from './components/Navbar';
import './css/LandingPage.css';
import { useTranslation } from 'react-i18next';

function LandingPage() {
  const { t, i18n } = useTranslation();
  

  return (
    <div className="lp-root">
      <Navbar />

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="lp-info">
        <div className="lp-info-inner">
          <div className="lp-info-col">
            <h2 className="lp-info-title">{t("about_title")}</h2>
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
            <button onClick={() => i18n.changeLanguage("pt")}>PT</button>
            <button onClick={() => i18n.changeLanguage("en")}>EN</button>
            <button onClick={() => i18n.changeLanguage("es")}>ES</button>
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