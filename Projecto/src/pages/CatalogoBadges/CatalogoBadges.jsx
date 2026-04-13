import { useMemo } from 'react';
import { ArrowLeft, Clock3, Filter, Search, SlidersHorizontal, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import '../../css/Consultor/CatalogoBadges_C.css';

const badgeLevels = [
  { levelKey: 'badge_level_junior', points: 100, badgeImage: '/badges/J%C3%BAnior.png' },
  { levelKey: 'badge_level_intermediate', points: 150, badgeImage: '/badges/Interm%C3%A9dio.png' },
  { levelKey: 'badge_level_senior', points: 200, badgeImage: '/badges/S%C3%A9nior.png' },
  { levelKey: 'badge_level_specialist', points: 250, badgeImage: '/badges/Especialista.png' },
  { levelKey: 'badge_level_knowledge_lead', points: 300, badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png' },
];

const badgeAreas = ['LowCode (Outsystems)', 'Cloud Architecture'];

function CatalogoBadges() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const badgeItems = useMemo(
    () => badgeAreas.flatMap((area) => badgeLevels.map((level) => ({
      id: `${area}-${level.levelKey}`,
      area,
      level: t(level.levelKey),
      points: level.points,
      badgeImage: level.badgeImage,
      date: '12 Jan 2026',
    }))),
    [t]
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
          <button type="button" className="catalog-back-btn" onClick={handleGoBack} aria-label={t('back')}>
            <ArrowLeft size={22} />
          </button>
          <h1>{t('catalog_title')}</h1>
        </header>

        <section className="catalog-shell">
          <div className="catalog-controls">
            <div className="catalog-search-wrap">
              <Search size={20} />
              <input type="text" placeholder={t('search_badges')} aria-label={t('search_badges')} />
            </div>
            <button type="button" className="catalog-action-btn">
              <Filter size={20} />
              <span>{t('filter_search')}</span>
            </button>
            <button type="button" className="catalog-action-btn">
              <SlidersHorizontal size={20} />
              <span>{t('sort')}</span>
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
                    <span>{item.points} {t('points')}</span>
                  </div>
                  <div className="catalog-meta-row">
                    <Clock3 size={14} />
                    <span>{item.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="catalog-pagination" role="navigation" aria-label={t('pagination')}>
            <button type="button" className="catalog-page-btn ghost" aria-label={t('previous_page')}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className="catalog-page-btn active">1</button>
            <button type="button" className="catalog-page-btn">2</button>
            <button type="button" className="catalog-page-btn">3</button>
            <button type="button" className="catalog-page-btn ghost" aria-label={t('next_page')}>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default CatalogoBadges;
