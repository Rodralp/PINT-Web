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
import { requestBadgeAcquisition } from '../../services/consultorService';
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
    setBadgeStatus(normalizeBadgeStatus(badge));
  }, [badge]);

  const requirements = useMemo(() => {
    const prefix = getRequirementPrefixByLevel(badge.levelKey);
    const showFiles = badgeStatus !== 'visualizar';

    return requirementTemplate.map((item, index) => ({
      ...item,
      title: `${prefix}${index + 1} - ${item.title}`,
      files: showFiles ? (index === 0 ? 2 : null) : null,
      image: badge.badgeImage,
    }));
  }, [badge.levelKey, badgeStatus, badge.badgeImage]);

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

  const canRequestBadge = badgeStatus === 'visualizar' || badgeStatus === 'evidencias_insuficientes';
  const isProgressStatus = badgeStatus === 'candidatura_em_progresso';
  const canSubmitProgress = canRequestBadge || isProgressStatus;
  const hasStatusBanner = badgeStatus !== 'visualizar';
  const statusMeta = statusConfig[badgeStatus] || null;
  const showReviewMessage = badgeStatus === 'evidencias_insuficientes';
  const showShareActions = badgeStatus === 'obtido';

  const handleRequestBadge = async () => {
    if (!badge?.badgeDbId || isSubmitting || !canSubmitProgress) {
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage('');
      const response = await requestBadgeAcquisition(badge.badgeDbId);
      const nextStatus = String(response?.status || 'candidatura_em_progresso').toLowerCase();

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

  const getFilesLabel = (files) => {
    const filesCount = Number(files);
    if (Number.isInteger(filesCount) && filesCount > 0) {
      return `${String(filesCount).padStart(2, '0')} Arquivos Submetidos`;
    }

    return 'XX Arquivos Submetidos';
  };

  const breadcrumbPath = `${badge.learningPathName || 'Jornada Técnica'} -> ${badge.serviceLineName || 'Application Operations'} -> ${badge.area} -> ${t(badge.levelKey)}`;

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

        <p className="badge-breadcrumb">{breadcrumbPath}</p>

        <section className="badge-requirements-card">
          <h3>Requisitos</h3>

          <div className="badge-requirements-list">
            {requirements.map((requirement, index) => {
              const isOpen = openRequirementId === requirement.id;
              const ToggleIcon = isOpen ? EyeOff : Eye;

              return (
                <article key={`${badge.id}-${requirement.id}`} className={`badge-requirement-item ${isOpen ? 'is-open' : ''}`}>
                  <div className="badge-requirement-head">
                    <div>
                      <p>{requirement.title}</p>
                      {badgeStatus !== 'visualizar' && (
                        <span>{getFilesLabel(requirement.files)}</span>
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
                      <p>{requirement.description}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
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
              disabled={!badge.badgeDbId || isSubmitting}
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
