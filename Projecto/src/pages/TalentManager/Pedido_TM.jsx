import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  File,
  FileText,
  SquareCheckBig,
  Users,
} from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/TalentManager/GestaoPedidos_TM.css';
import { getRequestById } from '../../data/requests/talentManagerRequestsData';

function PedidoTM() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [openRequirementId, setOpenRequirementId] = useState(null);
  const request = getRequestById(pedidoId);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/talent-manager/pedidos');
  };

  if (!request) {
    return (
      <Layout>
        <div className="tm-order-detail-page">
          <header className="tm-order-detail-header">
            <button type="button" className="tm-orders-back-btn" onClick={handleGoBack} aria-label="Voltar">
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

  const statusLabel =
    request.status === 'validacao'
      ? 'Em Validação'
      : request.status === 'rejeitado'
        ? 'Rejeitado'
        : request.status === 'enviado'
          ? 'Enviado a Service Line Leader'
          : 'Submetido';

  const StatusIcon = request.status === 'enviado' ? CheckCircle2 : request.status === 'validacao' ? Clock3 : FileText;
  const reviewedBy = request.reviewer;
  const reviewedAt = request.reviewerDate;

  const toggleRequirement = (requirementId) => {
    setOpenRequirementId((current) => (current === requirementId ? null : requirementId));
  };

  const getRequirementFilesLabel = (attachments) => {
    if (attachments.length === 1) {
      return '01 arquivo carregado';
    }

    return `${String(attachments.length).padStart(2, '0')} arquivos carregados`;
  };

  return (
    <Layout>
      <div className="tm-order-detail-page">
        <header className="tm-order-detail-header">
          <button type="button" className="tm-orders-back-btn" onClick={handleGoBack} aria-label="Voltar">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1>Candidatura</h1>
          </div>
        </header>

        <section className="tm-order-hero-grid">
          <div className="tm-order-hero-main">
            <div className="tm-order-hero-card">
              <div className="tm-order-badge-frame">
                <img src={request.badgeImage} alt={request.badge} className="tm-order-badge-image" />
              </div>

              <div className="tm-order-hero-content">
                <h2>{request.badge}</h2>
                <p>{request.levelLabel}</p>

                <div className="tm-order-hero-meta">
                  <span>
                    <Clock3 size={16} />
                    <strong>Expira</strong>
                    12 Jan 2026
                  </span>
                  <span>
                    <Users size={16} />
                    {request.status === 'rejeitado' ? '250 pontos' : request.status === 'enviado' ? '100 pontos' : '200 pontos'}
                  </span>
                  <span>
                    <FileText size={16} />
                    3 requisitos
                  </span>
                </div>

                <div className={`tm-order-status-banner ${request.status}`}>
                  <StatusIcon size={18} />
                  <span>{statusLabel}</span>
                </div>
              </div>
            </div>

            <p className="tm-order-breadcrumb">
              {request.area} {'>'} {request.path} {'>'} {request.badge} {'>'} {request.levelLabel.replace('Nível ', '')}
            </p>

            <section className="tm-order-requirements-card">
              <h3>Requisitos</h3>

              <div className="tm-order-requirements-list">
                {request.evidence.map((item) => (
                  <article key={item.id} className={`tm-order-requirement-item ${openRequirementId === item.id ? 'is-open' : ''}`}>
                    <div className="tm-order-requirement-head">
                      <div>
                        <p>{item.title}</p>
                        <span>{getRequirementFilesLabel(item.attachments || [])}</span>
                      </div>
                      <button
                        type="button"
                        className="tm-order-requirement-view-btn"
                        aria-label={openRequirementId === item.id ? `Ocultar ${item.title}` : `Ver ${item.title}`}
                        aria-expanded={openRequirementId === item.id}
                        onClick={() => toggleRequirement(item.id)}
                      >
                        {openRequirementId === item.id ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {openRequirementId === item.id && (
                      <div className="tm-order-requirement-detail">
                        <div className="tm-order-requirement-detail-media">
                          <img src={request.badgeImage} alt={request.badge} className="tm-order-requirement-detail-image" />
                        </div>
                        <div className="tm-order-requirement-detail-content">
                          <p>
                            {item.description ||
                              'Texto de exemplo que resume o requisito selecionado do subnível, do nível, da service line, do learning path.'}
                          </p>

                          <ul className="tm-order-requirement-files-list">
                            {(item.attachments || []).map((attachment) => (
                              <li key={attachment.id}>
                                <span className="tm-order-file-icon" aria-hidden="true">
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
                ))}
              </div>
            </section>
          </div>

          <aside className="tm-order-sidebar">
            <div className="tm-order-submission-card">
              <h3>Submissão por:</h3>
              <div className="tm-order-person-card">
                <div className="tm-order-person-avatar">{request.consultant.slice(0, 1)}</div>
                <div>
                  <strong>{request.consultant}</strong>
                  <span>
                    <CalendarDays size={14} />
                    01 de dezembro de 2025
                  </span>
                </div>
              </div>
            </div>

            {request.status === 'validacao' ? (
              <div className="tm-order-verdict-card">
                <h3>Veredito da Candidatura:</h3>
                <button type="button" className="tm-order-verdict-option">
                  <SquareCheckBig size={18} />
                  Aprovar
                </button>
                <button type="button" className="tm-order-verdict-option">
                  <SquareCheckBig size={18} />
                  Rejeitar
                </button>
              </div>
            ) : (
              <div className="tm-order-evaluated-card">
                <h3>Avaliado por:</h3>
                <div className="tm-order-person-card compact">
                  <div className="tm-order-person-avatar evaluated">{reviewedBy.slice(0, 1)}</div>
                  <div>
                    <strong>{reviewedBy}</strong>
                    <span>
                      <CalendarDays size={14} />
                      {reviewedAt}
                    </span>
                  </div>
                </div>
                <p>Evidências insuficientes para a conclusão da submissão.</p>
              </div>
            )}
          </aside>
        </section>
      </div>
    </Layout>
  );
}

export default PedidoTM;