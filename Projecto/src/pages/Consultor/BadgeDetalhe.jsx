import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Link,
  MessageSquare,
  SearchCheck,
  SendHorizontal,
  TimerReset,
  Trophy,
  Share2,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import { requestBadgeAcquisition, uploadEvidence } from '../../services/consultorService';
import '../../css/Consultor/BadgeDetalhe.css';

const defaultBadgeDetails = {
  id: 'badge-default',
  area: 'LowCode (Outsystems)',
  serviceLineName: 'Application Operations',
  learningPathName: 'Jornada Técnica',
  levelKey: 'badge_level_knowledge_lead',
  points: 300,
  badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png',
  date: '12 Jan 2026',
};

const fallbackBadges = [
  {
    id: 'my-1',
    area: 'LowCode (Outsystems)',
    serviceLineName: 'Application Operations',
    learningPathName: 'Jornada Técnica',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '12 Jan 2026',
  },
  {
    id: 'my-2',
    area: 'LowCode (Outsystems)',
    serviceLineName: 'Application Operations',
    learningPathName: 'Jornada Técnica',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '11 Jan 2026',
  },
  {
    id: 'my-3',
    area: 'LowCode (Outsystems)',
    serviceLineName: 'Application Operations',
    learningPathName: 'Jornada Técnica',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '10 Jan 2026',
  },
  {
    id: 'my-4',
    area: 'Cloud Architecture',
    serviceLineName: 'Hybrid Cloud',
    learningPathName: 'Jornada Técnica',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '09 Jan 2026',
  },
  {
    id: 'my-5',
    area: 'Cloud Architecture',
    serviceLineName: 'Hybrid Cloud',
    learningPathName: 'Jornada Técnica',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '08 Jan 2026',
  },
  {
    id: 'my-6',
    area: 'Cloud Architecture',
    serviceLineName: 'Hybrid Cloud',
    learningPathName: 'Jornada Técnica',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '07 Jan 2026',
  },
];

const requirementTemplate = [
  {
    id: 'req-1',
    title: 'Implementar conectividade híbrida',
    description: 'Texto de exemplo que resume o requisito selecionado do subnível, do nível, da service line e do learning path.',
  },
  {
    id: 'req-2',
    title: 'Monitorizar infraestrutura híbrida',
    description: 'Texto de exemplo com validações e evidências necessárias para demonstrar monitorização de ponta a ponta.',
  },
  {
    id: 'req-3',
    title: 'Implementar disaster recovery',
    description: 'Texto de exemplo sobre recuperação, redundância e procedimentos de continuidade operacional do serviço.',
  },
];

const statusConfig = {
  candidatura_em_progresso: {
    label: 'Candidatura em progresso',
    className: 'is-progress',
    Icon: TimerReset,
  },
  em_validacao: {
    label: 'Candidatura submetida - Em Validação',
    className: 'is-validation',
    Icon: SearchCheck,
  },
  evidencias_insuficientes: {
    label: 'Candidatura submetida - Evidências Insuficientes',
    className: 'is-rejected',
    Icon: AlertTriangle,
  },
  obtido: {
    label: 'Badge obtido',
    className: 'is-obtained',
    Icon: CheckCircle2,
  },
};

const normalizeBadgeStatus = (badge) => {
  const rawStatus = String(badge?.status || '').trim().toLowerCase();
  if (rawStatus) {
    return rawStatus;
  }

  const stateId = String(badge?.stateId || '').trim().toLowerCase();
  if (stateId === 'aprovado') {
    return 'obtido';
  }

  if (stateId === 'em_validacao') {
    return 'em_validacao';
  }

  if (stateId === 'candidatura_em_progresso') {
    return 'candidatura_em_progresso';
  }

  if (stateId === 'rejeitado') {
    return 'evidencias_insuficientes';
  }

  return 'visualizar';
};

const getRequirementPrefixByLevel = (levelKey) => {
  const normalized = String(levelKey || '').toLowerCase();
  if (normalized.includes('junior')) return 'A';
  if (normalized.includes('intermediate')) return 'B';
  if (normalized.includes('senior')) return 'C';
  if (normalized.includes('specialist')) return 'D';
  return 'E';
};

function BadgeDetalhe() {
  const { badgeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [openRequirementId, setOpenRequirementId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [filesByRequirement, setFilesByRequirement] = useState({});
  const [currentRequestId, setCurrentRequestId] = useState(() => Number(location.state?.badge?.requestId) || null);

  const badge = useMemo(() => {
    if (location.state?.badge) {
      return location.state.badge;
    }

    const decodedId = decodeURIComponent(badgeId || '');
    const matchedBadge = fallbackBadges.find((item) => item.id === decodedId);
    return matchedBadge || defaultBadgeDetails;
  }, [location.state, badgeId]);
  const [badgeStatus, setBadgeStatus] = useState(() => normalizeBadgeStatus(badge));

  useEffect(() => {
    // Initialize files state from badge payload when available (server may provide per-requirement files)
    const possible = badge?.requirementFiles || badge?.filesByRequirement || badge?.requirementSubmissions || badge?.submittedFiles;
    if (possible && typeof possible === 'object') {
      setFilesByRequirement(possible);
    }
  }, [badge]);

  useEffect(() => {
    setBadgeStatus(normalizeBadgeStatus(badge));
  }, [badge]);

  useEffect(() => {
    const nextRequestId = Number(badge?.requestId);
    setCurrentRequestId(Number.isInteger(nextRequestId) && nextRequestId > 0 ? nextRequestId : null);
  }, [badge]);

  const requirements = useMemo(() => {
    const prefix = getRequirementPrefixByLevel(badge.levelKey);
    const showFileCounters = badgeStatus !== 'visualizar';
    const sourceRequirements = Array.isArray(badge.requirements) && badge.requirements.length > 0
      ? badge.requirements
      : requirementTemplate;

    return sourceRequirements.map((item, index) => {
      const fallback = requirementTemplate[index % requirementTemplate.length];
      const rawTitle = String(item?.title || fallback.title || `Requisito ${index + 1}`).trim();
      const hasPrefixedTitle = /^[A-E]\d+\s*-\s*/i.test(rawTitle);
      const filesCount = Number(item?.files);

      return {
        ...item,
        id: String(item?.id || `req-${index + 1}`),
        title: hasPrefixedTitle ? rawTitle : `${prefix}${index + 1} - ${rawTitle}`,
        description: item?.description || fallback.description,
        files: Number.isInteger(filesCount) && filesCount >= 0
          ? filesCount
          : showFileCounters ? 0 : null,
        image: badge.badgeImage,
      };
    });
  }, [badge.requirements, badge.levelKey, badgeStatus, badge.badgeImage]);

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

  const openedFromCatalog =
    (typeof location.state?.backTo === 'string' && location.state.backTo === '/consultor/catalogo-badges') ||
    location.state?.activeSidebarRoute === '/consultor/catalogo-badges';

  const canRequestBadge =
    (badgeStatus === 'visualizar' || badgeStatus === 'evidencias_insuficientes') &&
    !(openedFromCatalog && badgeStatus === 'visualizar');
  const isProgressStatus = badgeStatus === 'candidatura_em_progresso';
  const canSubmitProgress = canRequestBadge || isProgressStatus;
  const hasStatusBanner = badgeStatus !== 'visualizar';
  const statusMeta = statusConfig[badgeStatus] || null;
  const showReviewMessage = badgeStatus === 'evidencias_insuficientes';
  const showShareActions = badgeStatus === 'obtido';

  const handleRequestBadge = async () => {
    setStatusMessage('A processar submissão...');

    if (isSubmitting) {
      return;
    }

    if (!canSubmitProgress) {
      setStatusMessage('Este badge não pode ser submetido no estado atual.');
      return;
    }

    if (!badge?.badgeDbId) {
      setStatusMessage('Não foi possível identificar o badge para submissão. Volte a abrir a partir de "Meus Badges".');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage('');

      const shouldUploadEvidence = badgeStatus === 'candidatura_em_progresso' || badgeStatus === 'evidencias_insuficientes';
      if (shouldUploadEvidence) {
        const requestId = Number(currentRequestId);
        if (!Number.isInteger(requestId) || requestId <= 0) {
          throw new Error('Pedido inválido para submissão de evidências.');
        }

        const entries = Object.entries(filesByRequirement);
        const uploads = [];

        for (const [requirementId, files] of entries) {
          const validFiles = Array.isArray(files) ? files.filter((f) => typeof File !== 'undefined' && f instanceof File) : [];
          if (validFiles.length === 0) {
            continue;
          }

          const nreqMatch = String(requirementId).match(/(\d+)/);
          const nreq = nreqMatch ? Number(nreqMatch[1]) : Number.NaN;
          if (!Number.isInteger(nreq) || nreq <= 0) {
            continue;
          }

          uploads.push(uploadEvidence(requestId, nreq, validFiles));
        }

        if (uploads.length === 0) {
          throw new Error('Adicione pelo menos um ficheiro antes de submeter.');
        }

        await Promise.all(uploads);
      }

      const response = await requestBadgeAcquisition(badge.badgeDbId);
      const nextStatus = String(response?.status || 'candidatura_em_progresso').toLowerCase();
      const returnedRequestId = Number(response?.requestId);
      if (Number.isInteger(returnedRequestId) && returnedRequestId > 0) {
        setCurrentRequestId(returnedRequestId);
      }

      setBadgeStatus(nextStatus);
      if (nextStatus === 'obtido') {
        setStatusMessage('Este badge ja foi adquirido.');
      } else if (isProgressStatus) {
        setStatusMessage('Candidatura já se encontra em progresso.');
      } else {
        setStatusMessage('Candidatura submetida com sucesso.');
      }
    } catch (error) {
      setStatusMessage(error?.message || 'Nao foi possivel submeter a candidatura.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilesLabel = (requirementId, filesProp) => {
    const arr = Array.isArray(filesByRequirement[requirementId]) ? filesByRequirement[requirementId] : null;
    const countFromState = arr ? arr.length : 0;
    const countFromProp = Number.isInteger(Number(filesProp)) && Number(filesProp) > 0 ? Number(filesProp) : 0;
    const total = countFromState > 0 ? countFromState : countFromProp;

    if (total > 0) return `${String(total).padStart(2, '0')} Arquivos Submetidos`;
    return 'Nenhum Arquivo Submetido';
  };

  const handleFilesSelected = (requirementId, fileList) => {
    const files = Array.from(fileList || []);
    setFilesByRequirement((current) => ({ ...current, [requirementId]: [...(current[requirementId] || []), ...files] }));
  };

  const handleRemoveFile = (requirementId, index) => {
    setFilesByRequirement((current) => {
      const arr = Array.isArray(current[requirementId]) ? [...current[requirementId]] : [];
      if (index >= 0 && index < arr.length) arr.splice(index, 1);
      return { ...current, [requirementId]: arr };
    });
  };

  const filesStorageKey = useMemo(() => `consultor-badge-files:${decodeURIComponent(badgeId || 'default')}`, [badgeId]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(filesStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setFilesByRequirement(parsed);
        }
      }
    } catch {
      // Ignore malformed storage and continue with empty state.
    }
  }, [badge, filesStorageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(filesStorageKey, JSON.stringify(filesByRequirement));
    } catch {
      // Ignore storage failures.
    }
  }, [filesByRequirement, filesStorageKey]);

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

            {hasStatusBanner && statusMeta && (
              <div className={`badge-status-banner ${statusMeta.className}`}>
                <statusMeta.Icon size={20} />
                <span>{statusMeta.label}</span>
              </div>
            )}

          </div>
        </section>

        <p className="badge-breadcrumb">
          {badge.area} {'>'} {badge.serviceLineName} {'>'} {badge.learningPathName} {'>'} {t(badge.levelKey)}
        </p>

        <section className="badge-requirements-card">
          <h3>Requisitos</h3>

            {requirements.map((requirement, index) => {
              const isOpen = openRequirementId === requirement.id;
              const ToggleIcon = isOpen ? EyeOff : Eye;

              return (
                <article key={`${badge.id}-${requirement.id}`} className={`badge-requirement-item ${isOpen ? 'is-open' : ''}`}>
                  <div className="badge-requirement-head">
                    <div>
                      <p>{requirement.title}</p>
                      {badgeStatus !== 'visualizar' && (
                        <span>{getFilesLabel(requirement.id, requirement.files)}</span>
                      )}
                    </div>

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
                      <div className="badge-requirement-detail-content">
                        <p>{requirement.description}</p>
                        {(badgeStatus === 'candidatura_em_progresso' || badgeStatus === 'evidencias_insuficientes') && (
                          <div className="badge-requirement-files">
                            <label className="badge-file-input-label">Anexar arquivos</label>
                            <input
                              className="badge-file-input"
                              type="file"
                              multiple
                              onChange={(e) => handleFilesSelected(requirement.id, e.target.files)}
                              aria-label={`Anexar arquivos ao requisito ${index + 1}`}
                            />

                            <div className="badge-file-list">
                              {Array.isArray(filesByRequirement[requirement.id]) && filesByRequirement[requirement.id].length > 0 ? (
                                filesByRequirement[requirement.id].map((f, fi) => (
                                  <div key={`${requirement.id}-file-${fi}`} className="badge-file-item">
                                    <span className="badge-file-name">{f.name}</span>
                                    <button
                                      type="button"
                                      className="badge-file-remove-btn"
                                      onClick={() => handleRemoveFile(requirement.id, fi)}
                                      aria-label={`Remover arquivo ${f.name}`}
                                    >
                                      Remover
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <div className="badge-file-none">Nenhum ficheiro anexado.</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
        </section>

        {showReviewMessage && (
          <section className="badge-review-card">
            <div className="badge-review-head">
              <h3>Mensagem do Talent Manager:</h3>
              <span>{badge.reviewerDate || '23 de dezembro de 2025'}</span>
            </div>
            <p>{badge.reviewMessage || 'Evidências insuficientes para a conclusão da submissão.'}</p>
          </section>
        )}

        <div className="badge-actions-row">
          {showShareActions && (
            <>
              <button type="button" className="badge-share-icon-btn" aria-label="Partilhar no Teams">
                <MessageSquare size={24} />
              </button>
              <button type="button" className="badge-share-icon-btn" aria-label="Partilhar no LinkedIn">
                <Link size={24} />
              </button>
              <button type="button" className="badge-share-primary-btn" aria-label="Partilhar">
                <Share2 size={20} />
                Partilhar
              </button>
            </>
          )}

          {!showShareActions && canSubmitProgress && (
            <button
              type="button"
              className="badge-submit-btn"
              disabled={isSubmitting}
              onClick={handleRequestBadge}
            >
              {badgeStatus === 'visualizar' ? null : <SendHorizontal size={20} />}
              {isSubmitting
                ? 'A submeter...'
                : badgeStatus === 'visualizar'
                  ? 'Iniciar Candidatura'
                  : 'Submeter'}
            </button>
          )}
        </div>

        {statusMessage && <p className="badge-feedback">{statusMessage}</p>}
      </div>
    </Layout>
  );
}

export default BadgeDetalhe;
