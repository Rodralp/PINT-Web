import { useMemo } from 'react';
import { ArrowLeft, Clock3, Filter, Search, SlidersHorizontal, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import '../../css/Consultor/CatalogoBadges_C.css';

const badgeLevels = [
  { level: 'Júnior', points: 100, badgeImage: '/badges/J%C3%BAnior.png' },
  { level: 'Intermédio', points: 150, badgeImage: '/badges/Interm%C3%A9dio.png' },
  { level: 'Sénior', points: 200, badgeImage: '/badges/S%C3%A9nior.png' },
  { level: 'Especialista', points: 250, badgeImage: '/badges/Especialista.png' },
  { level: 'Líder de Conhecimento', points: 300, badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png' },
];

const badgeAreas = ['LowCode (Outsystems)', 'Cloud Architecture'];

function CatalogoBadges() {
  const navigate = useNavigate();

  const badgeItems = useMemo(
    () => badgeAreas.flatMap((area) => badgeLevels.map((level) => ({
      id: `${area}-${level.level}`,
      area,
      ...level,
      date: '12 Jan 2026',
    }))),
    []
  );

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/consultor/dashboard');
  };

  return (
    <Layout>
      <div className="catalog-page">
        <header className="catalog-header">
          <button type="button" className="catalog-back-btn" onClick={handleGoBack} aria-label="Voltar">
            <ArrowLeft size={22} />
          </button>
          <h1>Catálogo de Badges</h1>
        </header>

        <section className="catalog-shell">
          <div className="catalog-controls">
            <div className="catalog-search-wrap">
              <Search size={20} />
              <input type="text" placeholder="Pesquisar badges" aria-label="Pesquisar badges" />
            </div>
            <button type="button" className="catalog-action-btn">
              <Filter size={20} />
              <span>Filtrar pesquisa</span>
            </button>
            <button type="button" className="catalog-action-btn">
              <SlidersHorizontal size={20} />
              <span>Ordenar</span>
            </button>
          </div>

          <div className="catalog-grid">
            {badgeItems.map((item) => (
              <article key={item.id} className="catalog-card">
                <div className="catalog-badge-frame">
                  <img className="catalog-badge-image" src={item.badgeImage} alt={item.level} />
                </div>

                <div className="catalog-card-title">{item.area}</div>
                <div className="catalog-card-level">{item.level}</div>

                <div className="catalog-card-meta">
                  <div className="catalog-meta-row">
                    <Trophy size={14} />
                    <span>{item.points} pontos</span>
                  </div>
                  <div className="catalog-meta-row">
                    <Clock3 size={14} />
                    <span>{item.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="catalog-pagination" role="navigation" aria-label="Paginação">
            <button type="button" className="catalog-page-btn ghost" aria-label="Página anterior">
              <ChevronLeft size={16} />
            </button>
            <button type="button" className="catalog-page-btn active">1</button>
            <button type="button" className="catalog-page-btn">2</button>
            <button type="button" className="catalog-page-btn">3</button>
            <button type="button" className="catalog-page-btn ghost" aria-label="Página seguinte">
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default CatalogoBadges;
