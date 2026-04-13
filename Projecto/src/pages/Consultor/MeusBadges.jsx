import { useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Filter, SearchCheck, Search, SlidersHorizontal, Trophy, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
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

const badgeStates = [
  {
    id: 'validado',
    label: 'Validado',
    tint: 'rgba(34, 197, 94, 0.18)',
    border: 'rgba(21, 128, 61, 0.48)',
    buttonBg: '#dcfce7',
    buttonBorder: '#16a34a',
    buttonColor: '#15803d',
    Icon: CheckCircle2,
  },
  {
    id: 'pendente',
    label: 'Pendente',
    tint: 'rgba(250, 204, 21, 0.14)',
    border: 'rgba(234, 179, 8, 0.36)',
    buttonBg: '#fef3c7',
    buttonBorder: '#eab308',
    buttonColor: '#b45309',
    Icon: SearchCheck,
  },
  {
    id: 'em_revisao',
    label: 'Em revisão',
    tint: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(37, 99, 235, 0.34)',
    buttonBg: '#dbeafe',
    buttonBorder: '#2563eb',
    buttonColor: '#1d4ed8',
    Icon: Clock3,
  },
  {
    id: 'rejeitado',
    label: 'Rejeitado',
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

  const badgeItems = useMemo(
    () => badgeAreas.flatMap((area, areaIndex) => badgeLevels.map((level, levelIndex) => {
      const state = badgeStates[(areaIndex + levelIndex) % badgeStates.length];

      return {
        id: `${area}-${level.level}`,
        area,
        state,
        ...level,
        date: '12 Jan 2026',
      };
    })),
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
          <h1>Meus Badges</h1>
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
                      <span>{item.points} pontos</span>
                    </div>
                    <div className="catalog-meta-row">
                      <Clock3 size={14} />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={item.state.label}
                    title={item.state.label}
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

export default MeusBadges;