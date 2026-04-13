import { useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Filter, SearchCheck, Search, SlidersHorizontal, Trophy, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
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

const badgeStates = [
  {
    id: 'validado',
    labelKey: 'badge_status_validated',
    tint: 'rgba(34, 197, 94, 0.18)',
    border: 'rgba(21, 128, 61, 0.48)',
    buttonBg: '#dcfce7',
    buttonBorder: '#16a34a',
    buttonColor: '#15803d',
    Icon: CheckCircle2,
  },
  {
    id: 'pendente',
    labelKey: 'badge_status_pending',
    tint: 'rgba(250, 204, 21, 0.14)',
    border: 'rgba(234, 179, 8, 0.36)',
    buttonBg: '#fef3c7',
    buttonBorder: '#eab308',
    buttonColor: '#b45309',
    Icon: SearchCheck,
  },
  {
    id: 'em_revisao',
    labelKey: 'badge_status_in_review',
    tint: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(37, 99, 235, 0.34)',
    buttonBg: '#dbeafe',
    buttonBorder: '#2563eb',
    buttonColor: '#1d4ed8',
    Icon: Clock3,
  },
  {
    id: 'rejeitado',
    labelKey: 'badge_status_rejected',
    tint: 'rgba(248, 113, 113, 0.12)',
    border: 'rgba(239, 68, 68, 0.34)',
    buttonBg: '#fee2e2',
    buttonBorder: '#ef4444',
    buttonColor: '#dc2626',
    Icon: AlertTriangle,
  },
];

function MeusBadges() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const badgeItems = useMemo(
    () => badgeAreas.flatMap((area, areaIndex) => badgeLevels.map((level, levelIndex) => {
      const state = badgeStates[(areaIndex + levelIndex) % badgeStates.length];

      const translatedLevel = t(level.levelKey);

      return {
        id: `${area}-${level.levelKey}`,
        area,
        state,
        level: translatedLevel,
        points: level.points,
        badgeImage: level.badgeImage,
        date: '12 Jan 2026',
      };
    })),
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
          <h1>{t('my_badges_title')}</h1>
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
            {badgeItems.map((item) => {
              const { Icon } = item.state;

              return (
                <article
                  key={item.id}
                  className="catalog-card"
                  style={{
                    background: item.state.tint,
                    borderColor: item.state.border,
                  }}
                >
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

                  <button
                    type="button"
                    aria-label={t(item.state.labelKey)}
                    title={t(item.state.labelKey)}
                    style={{
                      marginTop: '10px',
                      marginLeft: 'auto',
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      border: `2px solid ${item.state.buttonBorder}`,
                      background: item.state.buttonBg,
                      color: item.state.buttonColor,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </button>
                </article>
              );
            })}
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

export default MeusBadges;