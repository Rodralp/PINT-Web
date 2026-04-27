import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Layout from '../../components/Layout';
import { fetchMyServiceLine } from '../../services/serviceLineLeaderService';
import '../../css/Consultor/LearningPaths_C.css';

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

function MinhaServiceLineSLL() {
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
              </div>
            </article>

            <section className="lp-area-shell" aria-label={`Areas da service line ${serviceLine.name}`}>
              <div className="lp-area-list">
                {serviceLine.areas.map((area) => {
                  const isExpanded = expandedAreaIds.includes(area.id);

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
                          </div>

                          <div className="lp-level-list">
                            {area.levels.map((level, index) => (
                              <div
                                key={`${area.id}-${level.id}-${index}`}
                                className="lp-level-row"
                                aria-label={`Nivel ${level.title}`}
                              >
                                <div className="lp-level-copy">
                                  <strong>{level.title}</strong>
                                  <span>{level.subtitle}</span>
                                </div>
                              </div>
                            ))}
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
