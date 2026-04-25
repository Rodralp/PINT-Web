import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  SearchCheck,
  TimerReset,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { fetchMyServiceLine } from '../../services/serviceLineLeaderService';
import '../../css/Consultor/LearningPaths_C.css';

const statusConfig = {
  obtido: {
    label: 'Badge obtido',
    className: 'status-obtido',
    Icon: CheckCircle2,
  },
  candidatura_em_progresso: {
    label: 'Candidatura em progresso',
    className: 'status-progresso',
    Icon: TimerReset,
  },
  em_validacao: {
    label: 'Em Validacao',
    className: 'status-validacao',
    Icon: SearchCheck,
  },
  evidencias_insuficientes: {
    label: 'Evidencias insuficientes',
    className: 'status-insuficiente',
    Icon: AlertTriangle,
  },
  visualizar: {
    label: 'Visualizar',
    className: 'status-visualizar',
    Icon: null,
  },
};

const getStoredLoginData = () => {
  const storedLoginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');

  if (!storedLoginData) {
    return null;
  }

  try {
    return JSON.parse(storedLoginData);
  } catch {
    return null;
  }
};

const flattenServiceLineLevels = (serviceLine) =>
  (serviceLine?.areas || []).flatMap((area) => area.levels || []);

const calculateProgress = (levels) => {
  const total = levels.length;
  const obtidas = levels.filter((level) => level.status === 'obtido').length;
  const isComplete = total > 0 && obtidas === total;
  const percent = total > 0 ? Math.round((obtidas / total) * 100) : 0;

  return {
    total,
    obtidas,
    isComplete,
    percent,
    label: isComplete ? 'Area Completada' : `${obtidas} de ${total} badges obtidas`,
  };
};

function MinhaServiceLineSLL() {
  const navigate = useNavigate();
  const loginData = useMemo(() => getStoredLoginData(), []);
  const [serviceLine, setServiceLine] = useState(null);
  const [expandedAreaIds, setExpandedAreaIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadMyServiceLine = async () => {
      const accountId = Number(loginData?.id);

      if (!Number.isInteger(accountId) || accountId <= 0) {
        if (isMounted) {
          setErrorMessage('Nao foi possivel identificar o utilizador autenticado.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await fetchMyServiceLine(accountId);

        if (isMounted) {
          setServiceLine(data || null);
          setExpandedAreaIds([]);
          setErrorMessage('');
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error?.message || 'Nao foi possivel carregar a Service Line.');
          setServiceLine(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMyServiceLine();

    return () => {
      isMounted = false;
    };
  }, [loginData]);

  const toggleArea = (areaId) => {
    setExpandedAreaIds((current) =>
      current.includes(areaId) ? current.filter((id) => id !== areaId) : [...current, areaId],
    );
  };

  const openBadgeDetails = (area, level) => {
    const badgeId = `${area.id}-${level.id}`;

    navigate(`/consultor/badge/${encodeURIComponent(badgeId)}`, {
      state: {
        badge: {
          id: badgeId,
          area: area.name,
          levelKey: level.levelKey,
          points: level.points,
          badgeImage: level.badgeImage,
          date: '12 Jan 2026',
        },
        backTo: '/service-line-leader/minha-service-line',
        backToState: {
          expandedAreaIds: Array.from(new Set([...expandedAreaIds, area.id])),
        },
      },
    });
  };

  const progress = calculateProgress(flattenServiceLineLevels(serviceLine));

  return (
    <Layout>
      <div className="learning-paths-page is-classic">
        <header className="lp-header">
          <div className="lp-header-left">
            <div className="lp-header-copy">
              <h1>Minha Service Line</h1>
            </div>
          </div>
        </header>

        {isLoading && <p className="lp-progress-label">A carregar Service Line...</p>}

        {!isLoading && errorMessage && <p className="lp-progress-label">{errorMessage}</p>}

        {!isLoading && !errorMessage && serviceLine && (
          <section className="lp-shell lp-shell-surface">
            <article className="lp-service-line-hero">
              <img src={serviceLine.image} alt={serviceLine.name} className="lp-service-line-hero-image" />

              <div className="lp-service-line-hero-content">
                <h2>{serviceLine.name}</h2>
                <p>{serviceLine.description}</p>

                <span className="lp-progress-label">{progress.label}</span>
                <div className="lp-progress-track" aria-hidden="true">
                  <span
                    className={`lp-progress-fill ${progress.isComplete ? 'is-success' : 'is-primary'}`}
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            </article>

            <section className="lp-area-shell" aria-label={`Areas da service line ${serviceLine.name}`}>
              <div className="lp-area-list">
                {serviceLine.areas.map((area) => {
                  const isExpanded = expandedAreaIds.includes(area.id);
                  const areaProgress = calculateProgress(area.levels || []);

                  return (
                    <article key={area.id} className={`lp-area-card ${isExpanded ? 'is-expanded' : ''}`}>
                      <button
                        type="button"
                        className="lp-area-toggle"
                        onClick={() => toggleArea(area.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`area-badges-${area.id}`}
                      >
                        <div className="lp-area-banner">
                          <strong>{area.name}</strong>

                          <div className="lp-area-banner-actions">
                            <ChevronDown
                              size={20}
                              className={`lp-area-chevron ${isExpanded ? 'is-open' : ''}`}
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div id={`area-badges-${area.id}`} className="lp-area-badges">
                          <div className="lp-area-content-head">
                            <h3>Niveis</h3>
                            <span className="lp-progress-label">{areaProgress.label}</span>
                          </div>

                          <div className="lp-level-list">
                            {area.levels.map((level, index) => {
                              const status = statusConfig[level.status] || statusConfig.visualizar;
                              const StatusIcon = status.Icon;

                              return (
                                <button
                                  key={`${area.id}-${level.id}-${index}`}
                                  type="button"
                                  className="lp-level-row lp-level-row-action"
                                  onClick={() => openBadgeDetails(area, level)}
                                  aria-label={`Ver badge ${level.title}`}
                                >
                                  <div className="lp-level-copy">
                                    <strong>{level.title}</strong>
                                    <span>{level.subtitle}</span>
                                  </div>

                                  <span className={`lp-level-status ${status.className}`}>
                                    {StatusIcon ? <StatusIcon size={16} /> : null}
                                    {status.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        )}
      </div>
    </Layout>
  );
}

export default MinhaServiceLineSLL;
