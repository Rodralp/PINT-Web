import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  SearchCheck,
  TimerReset,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
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

const levelTemplate = [
  { id: 'nivel_a', title: 'Nivel Junior', subtitle: 'Nivel A' },
  { id: 'nivel_b', title: 'Nivel Intermedio', subtitle: 'Nivel B' },
  { id: 'nivel_c', title: 'Nivel Senior', subtitle: 'Nivel C' },
  { id: 'nivel_d', title: 'Nivel Especialista', subtitle: 'Nivel D' },
  { id: 'nivel_e', title: 'Nivel Lider de Conhecimento', subtitle: 'Nivel E' },
];

const buildLevels = (statuses) =>
  levelTemplate.map((level, index) => ({
    ...level,
    status: statuses[index] || 'visualizar',
  }));

const learningPathsData = [
  {
    id: 'jornada-tecnica',
    name: 'Jornada Tecnica',
    serviceLines: [
      {
        id: 'hybrid-cloud',
        name: 'Hybrid Cloud',
        description:
          'Aprender nuvem hibrida envolve bases de arquitetura, seguranca e gestao, e uso de ferramentas como GKE, Anthos ou NetApp.',
        image: '/LP_BG.png',
        areas: [
          {
            id: 'lowcode-outsystems',
            name: 'LowCode (Outsystems)',
            levels: buildLevels([
              'obtido',
              'candidatura_em_progresso',
              'em_validacao',
              'evidencias_insuficientes',
              'visualizar',
            ]),
          },
          {
            id: 'cloud-architecture',
            name: 'Cloud Architecture',
            levels: buildLevels(['obtido', 'obtido', 'candidatura_em_progresso', 'visualizar', 'visualizar']),
          },
        ],
      },
      {
        id: 'application-operations',
        name: 'Application Operations',
        description: 'Desc.',
        image: '/LP_BG.png',
        areas: [
          {
            id: 'application-operations-core',
            name: 'Application Operations',
            levels: buildLevels(['visualizar', 'visualizar', 'visualizar', 'visualizar', 'visualizar']),
          },
        ],
      },
      {
        id: 'sourcing-talent-management',
        name: 'Sourcing & Talent Management',
        description: 'Desc.',
        image: '/LP_BG.png',
        areas: [
          {
            id: 'sourcing-talent-management-core',
            name: 'Sourcing & Talent Management',
            levels: buildLevels(['obtido', 'obtido', 'obtido', 'obtido', 'obtido']),
          },
        ],
      },
    ],
  },
];

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

function LearningPaths() {
  const navigate = useNavigate();
  const [selectedPathId, setSelectedPathId] = useState(learningPathsData[0]?.id || null);
  const [selectedServiceLineId, setSelectedServiceLineId] = useState(null);
  const [expandedAreaIds, setExpandedAreaIds] = useState([]);

  const selectedPath = useMemo(
    () => learningPathsData.find((item) => item.id === selectedPathId) || learningPathsData[0],
    [selectedPathId],
  );

  const selectedServiceLine = useMemo(() => {
    if (!selectedPath || !selectedServiceLineId) {
      return null;
    }

    return selectedPath.serviceLines.find((item) => item.id === selectedServiceLineId) || null;
  }, [selectedPath, selectedServiceLineId]);

  const pageTitle = selectedServiceLine ? 'Service Line' : 'Learning Paths';

  const handleGoBack = () => {
    setSelectedServiceLineId(null);
    setExpandedAreaIds([]);
  };

  const selectServiceLine = (pathId, serviceLineId) => {
    setSelectedPathId(pathId);
    setSelectedServiceLineId(serviceLineId);
    setExpandedAreaIds([]);
  };

  const toggleArea = (areaId) => {
    setExpandedAreaIds((current) =>
      current.includes(areaId) ? current.filter((id) => id !== areaId) : [...current, areaId],
    );
  };

  const renderLearningPathView = () => {
    if (!selectedPath) {
      return null;
    }

    return (
      <section className="lp-shell lp-shell-surface">
        <article className="lp-path-card">
          <header className="lp-path-banner">
            <h2>{selectedPath.name}</h2>
          </header>

          <div className="lp-section-body">
            <div className="lp-section-title-row">
              <h3>Service Lines</h3>
            </div>

            <div className="lp-service-line-list">
              {selectedPath.serviceLines.map((serviceLine) => {
                const progress = calculateProgress(flattenServiceLineLevels(serviceLine));

                return (
                  <button
                    key={serviceLine.id}
                    type="button"
                    className="lp-service-line-card"
                    onClick={() => selectServiceLine(selectedPath.id, serviceLine.id)}
                  >
                    <div className="lp-service-line-head">
                      <strong>{serviceLine.name}</strong>
                      <ChevronRight size={24} className="lp-go-icon" aria-hidden="true" />
                    </div>

                    <div className="lp-service-line-body">
                      <img src={serviceLine.image} alt={serviceLine.name} className="lp-service-line-image" />

                      <div className="lp-service-line-main">
                        <p>{serviceLine.description}</p>
                        <span className="lp-progress-label">{progress.label}</span>

                        <div className="lp-progress-track" aria-hidden="true">
                          <span
                            className={`lp-progress-fill ${progress.isComplete ? 'is-success' : 'is-primary'}`}
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </article>
      </section>
    );
  };

  const renderServiceLineView = () => {
    if (!selectedServiceLine) {
      return null;
    }

    const selectedServiceLineProgress = calculateProgress(flattenServiceLineLevels(selectedServiceLine));

    return (
      <section className="lp-shell lp-shell-surface">
        <article className="lp-service-line-hero">
          <img src={selectedServiceLine.image} alt={selectedServiceLine.name} className="lp-service-line-hero-image" />

          <div className="lp-service-line-hero-content">
            <h2>{selectedServiceLine.name}</h2>
            <p>{selectedServiceLine.description}</p>

            <span className="lp-progress-label">{selectedServiceLineProgress.label}</span>
            <div className="lp-progress-track" aria-hidden="true">
              <span
                className={`lp-progress-fill ${selectedServiceLineProgress.isComplete ? 'is-success' : 'is-primary'}`}
                style={{ width: `${selectedServiceLineProgress.percent}%` }}
              />
            </div>
          </div>
        </article>

        <section className="lp-area-shell" aria-label={`Areas da service line ${selectedServiceLine.name}`}>
          <div className="lp-area-list">
            {selectedServiceLine.areas.map((area) => {
              const isExpanded = expandedAreaIds.includes(area.id);
              const progress = calculateProgress(area.levels || []);

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
                        <span className="lp-progress-label">{progress.label}</span>
                      </div>

                      <div className="lp-level-list">
                        {area.levels.map((level) => {
                          const status = statusConfig[level.status] || statusConfig.visualizar;
                          const StatusIcon = status.Icon;

                          return (
                            <article key={`${area.id}-${level.id}`} className="lp-level-row">
                              <div className="lp-level-copy">
                                <strong>{level.title}</strong>
                                <span>{level.subtitle}</span>
                              </div>

                              <span className={`lp-level-status ${status.className}`}>
                                {StatusIcon ? <StatusIcon size={16} /> : null}
                                {status.label}
                              </span>
                            </article>
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
    );
  };

  return (
    <Layout>
      <div className="learning-paths-page is-classic">
        <header className="lp-header">
          <div className="lp-header-left">
            {selectedServiceLine && (
              <button type="button" className="lp-back-btn" onClick={handleGoBack} aria-label="Voltar">
                <ArrowLeft size={20} />
              </button>
            )}

            <div className="lp-header-copy">
              <h1>{pageTitle}</h1>
            </div>
          </div>
        </header>

        {!selectedServiceLine && renderLearningPathView()}
        {selectedServiceLine && renderServiceLineView()}
      </div>
    </Layout>
  );
}

export default LearningPaths;
