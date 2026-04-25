import { useMemo, useState } from 'react';
import { ArrowLeft, Clock3, Eye, EyeOff, FileText, Trophy } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import '../../css/Consultor/BadgeDetalhe.css';

const defaultBadgeDetails = {
  id: 'badge-default',
  area: 'LowCode (Outsystems)',
  levelKey: 'badge_level_knowledge_lead',
  points: 300,
  badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png',
  date: '12 Jan 2026',
};

const fallbackBadges = [
  {
    id: 'my-1',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '12 Jan 2026',
  },
  {
    id: 'my-2',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '11 Jan 2026',
  },
  {
    id: 'my-3',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '10 Jan 2026',
  },
  {
    id: 'my-4',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '09 Jan 2026',
  },
  {
    id: 'my-5',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '08 Jan 2026',
  },
  {
    id: 'my-6',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '07 Jan 2026',
  },
];

const requirementsByArea = {
  'lowcode (outsystems)': [
    {
      id: 'e1',
      title: 'E1 - Implementar conectividade hibrida',
      description: 'Texto de exemplo que resume o requisito selecionado do subnivel, do nivel, da service line, do learning path.',
      image: '/badges/J%C3%BAnior.png',
    },
    {
      id: 'e2',
      title: 'E2 - Monitorizar infraestrutura hibrida',
      description: 'Texto de exemplo com validacoes e evidencias necessarias para demonstrar monitorizacao de ponta a ponta.',
      image: '/badges/Interm%C3%A9dio.png',
    },
    {
      id: 'e3',
      title: 'E3 - Implementar disaster recovery',
      description: 'Texto de exemplo sobre recuperacao, redundancia e procedimentos de continuidade operacional do servico.',
      image: '/badges/S%C3%A9nior.png',
    },
  ],
  'cloud architecture': [
    {
      id: 'e1',
      title: 'E1 - Configurar redes seguras multi-regiao',
      description: 'Texto de exemplo sobre conectividade segura, segmentacao de rede e controlo de acesso em multiplas regioes.',
      image: '/badges/J%C3%BAnior.png',
    },
    {
      id: 'e2',
      title: 'E2 - Implementar observabilidade de workloads cloud',
      description: 'Texto de exemplo sobre monitorizacao continua, alertas e correlacao de logs para workloads cloud.',
      image: '/badges/Interm%C3%A9dio.png',
    },
    {
      id: 'e3',
      title: 'E3 - Definir estrategia de resiliencia e backup',
      description: 'Texto de exemplo que resume politicas de backup, recuperacao e testes de resiliencia em ambiente cloud.',
      image: '/badges/S%C3%A9nior.png',
    },
  ],
};

function BadgeDetalhe() {
  const { badgeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [openRequirementId, setOpenRequirementId] = useState(null);

  const badge = useMemo(() => {
    if (location.state?.badge) {
      return location.state.badge;
    }

    const decodedId = decodeURIComponent(badgeId || '');
    const matchedBadge = fallbackBadges.find((item) => item.id === decodedId);
    return matchedBadge || defaultBadgeDetails;
  }, [location.state, badgeId]);

  const requirements = useMemo(() => {
    const areaKey = (badge.area || '').trim().toLowerCase();
    return requirementsByArea[areaKey] || requirementsByArea['lowcode (outsystems)'];
  }, [badge.area]);

  const fallbackBackRoute =
    typeof location.state?.backTo === 'string' && location.state.backTo.trim().length > 0
      ? location.state.backTo
      : '/consultor/meus-badges';

  const fallbackBackState =
    location.state?.backToState && typeof location.state.backToState === 'object'
      ? location.state.backToState
      : undefined;

  const handleGoBack = () => {
    if (typeof location.state?.backTo === 'string' && location.state.backTo.trim().length > 0) {
      navigate(fallbackBackRoute, { state: fallbackBackState });
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackBackRoute);
  };

  const toggleRequirement = (requirementId) => {
    setOpenRequirementId((current) => (current === requirementId ? null : requirementId));
  };

  return (
    <Layout>
      <div className="badge-details-page">
        <header className="badge-details-header">
          <button type="button" className="badge-details-back-btn" onClick={handleGoBack} aria-label={t('back')}>
            <ArrowLeft size={22} />
          </button>
          <h1>Badge</h1>
        </header>

        <section className="badge-hero-card" aria-label={`Detalhes do badge ${badgeId || ''}`}>
          <div className="badge-hero-media">
            <img src={badge.badgeImage} alt={t(badge.levelKey)} className="badge-hero-image" />
          </div>

          <div className="badge-hero-content">
            <h2>{badge.area}</h2>
            <p>{t(badge.levelKey)}</p>

            <div className="badge-hero-meta">
              <span>
                <Clock3 size={16} />
                <strong>Expira</strong>
                {badge.date}
              </span>
              <span>
                <Trophy size={16} />
                {badge.points} pontos
              </span>
              <span>
                <FileText size={16} />
                {requirements.length} requisitos
              </span>
            </div>
          </div>
        </section>

        <section className="badge-requirements-card">
          <h3>Requisitos</h3>

          <div className="badge-requirements-list">
            {requirements.map((requirement, index) => {
              const isOpen = openRequirementId === requirement.id;
              const ToggleIcon = isOpen ? EyeOff : Eye;

              return (
                <article key={`${badge.id}-${requirement.id}`} className={`badge-requirement-item ${isOpen ? 'is-open' : ''}`}>
                  <div className="badge-requirement-head">
                    <p>{requirement.title}</p>
                    <button
                      type="button"
                      className="badge-requirement-view-btn"
                      aria-label={isOpen ? `Ocultar requisito ${index + 1}` : `Ver requisito ${index + 1}`}
                      title={isOpen ? 'Ocultar requisito' : 'Ver requisito'}
                      aria-expanded={isOpen}
                      onClick={() => toggleRequirement(requirement.id)}
                    >
                      <ToggleIcon size={19} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="badge-requirement-detail">
                      <img
                        src={requirement.image || badge.badgeImage}
                        alt={`Ilustracao do requisito ${index + 1}`}
                        className="badge-requirement-detail-image"
                      />
                      <p>{requirement.description}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default BadgeDetalhe;