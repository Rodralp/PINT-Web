import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock3, Eye, EyeOff, FileText, Trophy } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import { fetchCatalogBadges, fetchBadgeRequirements } from './services/consultorService';
import './css/BadgePublica.css';

const defaultBadgeDetails = {
  id: 'badge-public-default',
  name: 'LowCode (Outsystems)',
  area: 'LowCode (Outsystems)',
  levelKey: 'badge_level_knowledge_lead',
  points: 300,
  badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png',
  date: '12 Jan 2026',
};

const fallbackBadges = [
  {
    id: 'cloud-junior',
    name: 'Cloud Architecture',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_junior',
    points: 100,
    badgeImage: '/badges/J%C3%BAnior.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-intermediate',
    name: 'Cloud Architecture',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-senior',
    name: 'Cloud Architecture',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '12 Jan 2026',
  },
  {
    id: 'lowcode-specialist',
    name: 'LowCode (Outsystems)',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '12 Jan 2026',
  },
  {
    id: 'lowcode-lead',
    name: 'LowCode (Outsystems)',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_knowledge_lead',
    points: 300,
    badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png',
    date: '12 Jan 2026',
  },
];

const resolveBadgeDbId = (routeBadgeId, badgeState) => {
  const direct = Number(badgeState?.badgeDbId);
  if (Number.isInteger(direct) && direct > 0) {
    return direct;
  }

  const fromRoute = String(routeBadgeId || '').trim();
  if (fromRoute) {
    const numericRoute = Number(fromRoute);
    if (Number.isInteger(numericRoute) && numericRoute > 0) {
      return numericRoute;
    }

    const match = fromRoute.match(/^badge-(\d+)$/i);
    if (match) {
      const numericMatch = Number(match[1]);
      if (Number.isInteger(numericMatch) && numericMatch > 0) {
        return numericMatch;
      }
    }
  }

  const fromStateId = String(badgeState?.id || '').trim();
  if (fromStateId) {
    const numericStateId = Number(fromStateId);
    if (Number.isInteger(numericStateId) && numericStateId > 0) {
      return numericStateId;
    }

    const match = fromStateId.match(/^badge-(\d+)$/i);
    if (match) {
      const numericMatch = Number(match[1]);
      if (Number.isInteger(numericMatch) && numericMatch > 0) {
        return numericMatch;
      }
    }
  }

  return null;
};

function BadgePublica() {
  const { badgeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [openRequirementId, setOpenRequirementId] = useState(null);
  const [dynamicRequirements, setDynamicRequirements] = useState(null);

  const badge = useMemo(() => {
    if (location.state?.badge) {
      return location.state.badge;
    }

    const decodedId = decodeURIComponent(badgeId || '');
    const matchedBadge = fallbackBadges.find((item) => item.id === decodedId);
    return matchedBadge || defaultBadgeDetails;
  }, [location.state, badgeId]);

  const resolvedBadgeDbId = useMemo(
    () => resolveBadgeDbId(badgeId, badge),
    [badgeId, badge],
  );

  const badgeTitle = badge.name || badge.area || 'Badge';

  useEffect(() => {
    let isMounted = true;

    const loadBadgeFromApi = async () => {
      if (location.state?.badge) return;

      try {
        const items = await fetchCatalogBadges();
        if (!isMounted || !Array.isArray(items)) return;

        const decodedId = decodeURIComponent(badgeId || '');
        const matched = items.find((it) => String(it.id) === String(decodedId) || String(it.badgeDbId) === decodedId || String(it.id) === `badge-${decodedId}`);
        if (matched && isMounted) {
          const template = matched;
          try {
            navigate(location.pathname, { replace: true, state: { badge: template } });
          } catch {
            // ignore navigation errors
          }
        }
      } catch (e) {
        // ignore and keep fallback
      }
    };

    loadBadgeFromApi();

    return () => {
      isMounted = false;
    };
  }, [badgeId, location.state, navigate, location.pathname]);

  useEffect(() => {
    let isMounted = true;

    const loadRequirements = async () => {
      try {
        const badgeDbId = resolvedBadgeDbId;
        if (!badgeDbId) return;

        const reqs = await fetchBadgeRequirements(badgeDbId);
        if (isMounted && Array.isArray(reqs)) {
          setDynamicRequirements(reqs);
        }
      } catch (e) {
        // ignore and keep static requirements
      }
    };

    loadRequirements();

    return () => {
      isMounted = false;
    };
  }, [resolvedBadgeDbId]);

  const requirements = useMemo(() => {
    if (dynamicRequirements && Array.isArray(dynamicRequirements) && dynamicRequirements.length > 0) {
      return dynamicRequirements;
    }
    if (Array.isArray(badge.requirements) && badge.requirements.length > 0) {
      return badge.requirements;
    }
    return [];
  }, [dynamicRequirements, badge.requirements]);

  const handleGoBack = () => {
    navigate('/galeria-publica');
  };

  const toggleRequirement = (requirementId) => {
    setOpenRequirementId((current) => (current === requirementId ? null : requirementId));
  };

  return (
    <div className="bp-root">
      <Navbar />

      <main className="bp-main">
        <section className="bp-shell">
          <div className="bp-page">
            <header className="bp-header">
              <button type="button" className="bp-back-btn" onClick={handleGoBack} aria-label={t('back')}>
                <ArrowLeft size={22} />
              </button>
              <h1>Badge</h1>
            </header>

            <section className="bp-hero-card" aria-label={`Detalhes do badge ${badgeId || ''}`}>
              <div className="bp-hero-media">
                <img src={badge.badgeImage} alt={t(badge.levelKey)} className="bp-hero-image" />
              </div>

              <div className="bp-hero-content">
                <h2>{badgeTitle}</h2>
                <p>{t(badge.levelKey)}</p>

                <div className="bp-hero-meta">
                  <span>
                    <Clock3 size={16} />
                    <strong>Expira</strong>
                    {badge.date}
                  </span>
                  <span>
                    <Trophy size={16} />
                    {badge.points} {t('points')}
                  </span>
                  <span>
                    <FileText size={16} />
                    {requirements.length} requisitos
                  </span>
                </div>
              </div>
            </section>

            <p className="bp-breadcrumb">
              Jornada Tecnica {'>'} Application Operations {'>'} {badgeTitle} {'>'} {t(badge.levelKey)}
            </p>

            <section className="bp-requirements-card">
              <h3>Requisitos</h3>
              {requirements.length === 0 ? (
                <p className="bp-requirements-empty">Sem requisitos definidos para este badge.</p>
              ) : (
                <div className="bp-requirements-list">
                  {requirements.map((requirement, index) => {
                    const isOpen = openRequirementId === requirement.id;
                    const ToggleIcon = isOpen ? EyeOff : Eye;

                    return (
                      <article key={`${badge.id}-${requirement.id}`} className={`bp-requirement-item ${isOpen ? 'is-open' : ''}`}>
                        <div className="bp-requirement-head">
                          <p>{requirement.title}</p>
                          <button
                            type="button"
                            className="bp-requirement-view-btn"
                            aria-label={isOpen ? `Ocultar requisito ${index + 1}` : `Ver requisito ${index + 1}`}
                            title={isOpen ? 'Ocultar requisito' : 'Ver requisito'}
                            aria-expanded={isOpen}
                            onClick={() => toggleRequirement(requirement.id)}
                          >
                            <ToggleIcon size={19} />
                          </button>
                        </div>

                        {isOpen && (
                          <div className="bp-requirement-detail">
                            <img
                              src={requirement.image || badge.badgeImage}
                              alt={`Ilustracao do requisito ${index + 1}`}
                              className="bp-requirement-detail-image"
                            />
                            <p>{requirement.description}</p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default BadgePublica;
