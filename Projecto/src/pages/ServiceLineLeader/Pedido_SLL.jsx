import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  File,
  FileText,
  SearchCheck,
  Square,
  SquareCheckBig,
  Trophy,
} from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/ServiceLineLeader/GestaoPedidos_SLL.css';
import { getRequestById } from '../../data/requests/serviceLineLeaderRequestsData';

const statusMeta = {
  validacao: {
    label: 'Em Validação',
    className: 'validacao',
    icon: SearchCheck,
  },
  rejeitado: {
    label: 'Rejeitado',
    className: 'rejeitado',
    icon: AlertTriangle,
  },
  aprovado: {
    label: 'Aprovado',
    className: 'aprovado',
    icon: CheckCircle2,
  },
};

const verdictOptions = [
  { id: 'aprovar', label: 'Aprovar' },
  { id: 'enviar-atras', label: 'Enviar para trás' },
  { id: 'rejeitar', label: 'Rejeitar' },
];

function PedidoSLL() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [openRequirementId, setOpenRequirementId] = useState(null);
  const [selectedVerdict, setSelectedVerdict] = useState(null);
  const request = getRequestById(pedidoId);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/service-line-leader/pedidos');
  };

  if (!request) {
    return (
      <Layout>
        <div className="sll-order-detail-page">
          <header className="sll-order-detail-header">
            <button type="button" className="sll-orders-back-btn" onClick={handleGoBack} aria-label="Voltar">
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1>Pedido não encontrado</h1>
              <p>O pedido não existe ou foi removido.</p>
            </div>
          </header>
        </div>
      </Layout>
    );
  }

  const currentStatus = statusMeta[request.status] || statusMeta.validacao;
  const StatusIcon = currentStatus.icon;

  const toggleRequirement = (requirementId) => {
    setOpenRequirementId((current) => (current === requirementId ? null : requirementId));
  };

  const getRequirementFilesLabel = (attachments) => {
    if (attachments.length === 1) {
      return '01 arquivo carregado';
    }

    return `${String(attachments.length).padStart(2, '0')} arquivos carregados`;
  };

  const showVerdict = request.status === 'validacao';

  return (
    <Layout>
      <div className="sll-order-detail-page">
        <header className="sll-order-detail-header">
          <button type="button" className="sll-orders-back-btn" onClick={handleGoBack} aria-label="Voltar">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1>Candidatura</h1>
          </div>
        </header>

        <section className="sll-order-hero-grid">
          <div className="sll-order-hero-main">
            <div className="sll-order-hero-card">
              <div className="sll-order-badge-frame">
                <img src={request.badgeImage} alt={request.badge} className="sll-order-badge-image" />
              </div>

              <div className="sll-order-hero-content">
                <h2>{request.badge}</h2>
                <p>{request.levelLabel}</p>

                <div className="sll-order-hero-meta">
                  <span>
                    <Clock3 size={16} />
                    <strong>Expira</strong>
                    12 Jan 2026
                  </span>
                  <span>
                    <Trophy size={16} />
                    {request.points} pontos
                  </span>
                  <span>
                    <FileText size={16} />
                    {request.evidence.length} requisitos
                  </span>
                </div>

                <div className={`sll-order-status-banner ${currentStatus.className}`}>
                  <StatusIcon size={18} />
                  <span>{currentStatus.label}</span>
                </div>
              </div>
            </div>

            <p className="sll-order-breadcrumb">
              {request.area} {'>'} {request.path} {'>'} {request.badge} {'>'} {request.levelLabel.replace('Nível ', '')}
            </p>

            <section className="sll-order-requirements-card">
              <h3>Requisitos</h3>

              <div className="sll-order-requirements-list">
                {request.evidence.map((item) => {
                  return (
                    <article
                      key={item.id}
                      className={`sll-order-requirement-item ${openRequirementId === item.id ? 'is-open' : ''}`}
                    >
                      <div className="sll-order-requirement-head">
                        <div>
                          <p>{item.title}</p>
                          <span>{getRequirementFilesLabel(item.attachments || [])}</span>
                        </div>
                        <button
                          type="button"
                          className="sll-order-requirement-view-btn"
                          aria-label={openRequirementId === item.id ? `Ocultar ${item.title}` : `Ver ${item.title}`}
                          aria-expanded={openRequirementId === item.id}
                          onClick={() => toggleRequirement(item.id)}
                        >
                          {openRequirementId === item.id ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>

                      {openRequirementId === item.id && (
                        <div className="sll-order-requirement-detail">
                          <div className="sll-order-requirement-detail-media">
                            <img
                              src={request.badgeImage}
                              alt={request.badge}
                              className="sll-order-requirement-detail-image"
                            />
                          </div>
                          <div className="sll-order-requirement-detail-content">
                            <p>{item.description}</p>

                            <ul className="sll-order-requirement-files-list">
                              {(item.attachments || []).map((attachment) => (
                                <li key={attachment.id}>
                                  <span className="sll-order-file-icon" aria-hidden="true">
                                    {attachment.type === 'pdf' ? <FileText size={18} /> : <File size={18} />}
                                  </span>
                                  <span>{attachment.label}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="sll-order-sidebar">
            <div className="sll-order-review-card">
              <h3>Submissão por:</h3>
              <div className="sll-order-person-card">
                <img
                  src={request.submittedByAvatar}
                  alt={request.submittedBy}
                  className="sll-order-person-avatar"
                />
                <div>
                  <strong>{request.submittedBy}</strong>
                  <span>
                    <CalendarDays size={14} />
                    {request.submittedDate}
                  </span>
                </div>
              </div>

              <h3 className="sll-order-subtitle">Avaliado por:</h3>
              <div className="sll-order-person-card compact">
                <img
                  src={request.reviewerAvatar}
                  alt={request.reviewer}
                  className="sll-order-person-avatar"
                />
                <div>
                  <strong>{request.reviewer}</strong>
                  <span>
                    <CalendarDays size={14} />
                    {request.reviewerDate}
                  </span>
                </div>
              </div>

              <p className="sll-order-note">{request.notes}</p>

              {request.finalReviewer && (
                <div className="sll-order-person-card compact final">
                  <img
                    src={request.finalReviewerAvatar}
                    alt={request.finalReviewer}
                    className="sll-order-person-avatar"
                  />
                  <div>
                    <strong>{request.finalReviewer}</strong>
                    <span>
                      <CalendarDays size={14} />
                      {request.finalReviewerDate}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {showVerdict && (
              <div className="sll-order-verdict-card">
                <h3>Veredito da Candidatura:</h3>
                {verdictOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`sll-order-verdict-option ${selectedVerdict === option.id ? 'active' : ''}`}
                    onClick={() => setSelectedVerdict(option.id)}
                  >
                    {selectedVerdict === option.id ? <SquareCheckBig size={18} /> : <Square size={18} />}
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </aside>
        </section>
      </div>
    </Layout>
  );
}

export default PedidoSLL;
