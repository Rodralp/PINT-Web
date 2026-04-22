import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  MessageSquare,
  SearchCheck,
  Users,
  X,
} from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/AdminGestor/GestaoPedidos_AG.css';

const ITEMS_PER_PAGE = 10;

const tableFilters = [
  { id: 'aprovado', label: 'Aprovado' },
  { id: 'pendente', label: 'Pendente' },
  { id: 'rejeitado', label: 'Rejeitado' },
];

const tableStatusStyles = {
  aprovado: 'approved',
  pendente: 'pending',
  rejeitado: 'rejected',
};

const initialRequests = [
  {
    id: 1,
    consultant: 'Ana Costa',
    serviceLine: 'LowCode',
    badge: 'UX/UI Design',
    level: 'Especialista',
    date: '05/12/2025',
    tableStatus: 'pendente',
    finalReviewer: null,
    finalDate: null,
  },
  {
    id: 2,
    consultant: 'Pedro Mendes',
    serviceLine: 'Cloud',
    badge: 'Data Analytics',
    level: 'Especialista',
    date: '04/12/2025',
    tableStatus: 'rejeitado',
    finalReviewer: 'Admin / Gestor',
    finalDate: '06/12/2025',
  },
  {
    id: 3,
    consultant: 'Maria Santos',
    serviceLine: 'Data & AI',
    badge: 'LowCode (Outsystems)',
    level: 'Júnior',
    date: '03/12/2025',
    tableStatus: 'aprovado',
    finalReviewer: 'Admin / Gestor',
    finalDate: '06/12/2025',
  },
  {
    id: 4,
    consultant: 'João Gomes',
    serviceLine: 'LowCode',
    badge: 'LowCode (OutSystems)',
    level: 'Especialista',
    date: '01/12/2025',
    tableStatus: 'pendente',
    finalReviewer: null,
    finalDate: null,
  },
  {
    id: 5,
    consultant: 'Carlos Ferreira',
    serviceLine: 'Cybersecurity',
    badge: 'Cybersecurity',
    level: 'Júnior',
    date: '28/11/2025',
    tableStatus: 'pendente',
    finalReviewer: null,
    finalDate: null,
  },
  {
    id: 6,
    consultant: 'Bruno Alves',
    serviceLine: 'Cloud',
    badge: 'Machine Learning',
    level: 'Especialista',
    date: '25/11/2025',
    tableStatus: 'aprovado',
    finalReviewer: 'Admin / Gestor',
    finalDate: '29/11/2025',
  },
  {
    id: 7,
    consultant: 'Sofia Rodrigues',
    serviceLine: 'LowCode',
    badge: 'Mobile Development',
    level: 'Especialista',
    date: '22/11/2025',
    tableStatus: 'rejeitado',
    finalReviewer: 'Admin / Gestor',
    finalDate: '24/11/2025',
  },
  {
    id: 8,
    consultant: 'Inês Carvalho',
    serviceLine: 'Data & AI',
    badge: 'IoT Solutions',
    level: 'Júnior',
    date: '18/11/2025',
    tableStatus: 'pendente',
    finalReviewer: null,
    finalDate: null,
  },
  {
    id: 9,
    consultant: 'Rui Pereira',
    serviceLine: 'Cloud',
    badge: 'DevOps',
    level: 'Sénior',
    date: '15/11/2025',
    tableStatus: 'pendente',
    finalReviewer: null,
    finalDate: null,
  },
  {
    id: 10,
    consultant: 'Marta Pinto',
    serviceLine: 'Data & AI',
    badge: 'Blockchain',
    level: 'Especialista',
    date: '12/11/2025',
    tableStatus: 'aprovado',
    finalReviewer: 'Admin / Gestor',
    finalDate: '13/11/2025',
  },
  {
    id: 11,
    consultant: 'Filipa Nunes',
    serviceLine: 'Cybersecurity',
    badge: 'SAP Integration',
    level: 'Intermédio',
    date: '10/11/2025',
    tableStatus: 'pendente',
    finalReviewer: null,
    finalDate: null,
  },
  {
    id: 12,
    consultant: 'Miguel Costa',
    serviceLine: 'Cloud',
    badge: 'Observability',
    level: 'Sénior',
    date: '08/11/2025',
    tableStatus: 'rejeitado',
    finalReviewer: 'Admin / Gestor',
    finalDate: '10/11/2025',
  },
];

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

const getTableLabel = (tableStatus) => {
  if (tableStatus === 'aprovado') {
    return 'Aprovado';
  }

  if (tableStatus === 'rejeitado') {
    return 'Rejeitado';
  }

  return 'Pendente';
};

const getFormattedToday = () => new Date().toLocaleDateString('pt-PT');

const reviewedByTalentManagerPendingIds = new Set([1, 4, 8, 9, 11]);

const getTalentManagerReview = (request) => {
  const alreadyReviewedByTalentManager =
    request.tableStatus !== 'pendente' || reviewedByTalentManagerPendingIds.has(request.id);

  if (!alreadyReviewedByTalentManager) {
    return null;
  }

  if (request.tableStatus === 'rejeitado') {
    return {
      reviewer: 'Talent Manager',
      reviewedDate: '23 de dezembro de 2025',
      message: 'Evidências insuficientes para concluir o nível pedido. Recomendado reforço técnico.',
    };
  }

  if (request.tableStatus === 'aprovado') {
    return {
      reviewer: 'Talent Manager',
      reviewedDate: '23 de dezembro de 2025',
      message: 'Evidências técnicas válidas e consistentes com os critérios do nível submetido.',
    };
  }

  return {
    reviewer: 'Talent Manager',
    reviewedDate: '12 de janeiro de 2026',
    message: 'Validação técnica concluída. Pedido encaminhado para decisão final do Admin/Gestor.',
  };
};

function GestaoPedidosAG() {
  const navigate = useNavigate();
  const loginData = useMemo(() => getStoredLoginData(), []);
  const [requests, setRequests] = useState(initialRequests);
  const [activeFilters, setActiveFilters] = useState(tableFilters.map((filter) => filter.id));
  const [page, setPage] = useState(1);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const adminName = loginData?.nome || 'Admin / Gestor';

  const summaryCounts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.tableStatus === 'pendente').length,
      approved: requests.filter((request) => request.tableStatus === 'aprovado').length,
      rejected: requests.filter((request) => request.tableStatus === 'rejeitado').length,
    }),
    [requests],
  );

  const summaryCards = useMemo(
    () => [
      { id: 'total', label: 'Todos', tone: 'gray', value: summaryCounts.total, icon: Clock3 },
      { id: 'pending', label: 'Pendentes', tone: 'amber', value: summaryCounts.pending, icon: SearchCheck },
      { id: 'approved', label: 'Aprovados', tone: 'green', value: summaryCounts.approved, icon: CheckCircle2 },
      { id: 'rejected', label: 'Rejeitados', tone: 'red', value: summaryCounts.rejected, icon: AlertTriangle },
    ],
    [summaryCounts],
  );

  const filteredRequests = useMemo(() => {
    if (activeFilters.length === 0) {
      return [];
    }

    return requests.filter((request) => activeFilters.includes(request.tableStatus));
  }, [activeFilters, requests]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const pagedRequests = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredRequests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRequests, safePage]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) || null,
    [requests, selectedRequestId],
  );

  const selectedRequestTmReview = useMemo(
    () => (selectedRequest ? getTalentManagerReview(selectedRequest) : null),
    [selectedRequest],
  );

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/admin-gestor/dashboard');
  };

  const toggleFilter = (filterId) => {
    setActiveFilters((current) => {
      if (current.includes(filterId)) {
        return current.filter((item) => item !== filterId);
      }

      return [...current, filterId];
    });

    setPage(1);
  };

  const decideRequest = (requestId, nextStatus) => {
    setRequests((current) =>
      current.map((request) => {
        if (request.id !== requestId) {
          return request;
        }

        return {
          ...request,
          tableStatus: nextStatus,
          finalReviewer: adminName,
          finalDate: getFormattedToday(),
        };
      }),
    );
  };

  const openRequestDetails = (requestId) => {
    setSelectedRequestId(requestId);
  };

  const closeRequestDetails = () => {
    setSelectedRequestId(null);
  };

  const previousPage = () => setPage((current) => Math.max(1, current - 1));
  const nextPage = () => setPage((current) => Math.min(totalPages, current + 1));

  return (
    <Layout>
      <div className="ag-orders-page">
        <header className="ag-orders-header">
          <button type="button" className="ag-orders-back-btn" onClick={handleGoBack} aria-label="Voltar">
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1>Gestão de Pedidos</h1>
            <p>A decisão do Admin/Gestor é final: ao aprovar ou rejeitar, o pedido fica concluído.</p>
          </div>
        </header>

        <section className="ag-orders-summary-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.id} className={`ag-request-card ${card.tone}`}>
                <span className="ag-request-card-icon">
                  <Icon size={26} strokeWidth={2} />
                </span>

                <div className="ag-request-card-content">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </div>
              </article>
            );
          })}
        </section>

        <section className="ag-orders-main-card">
          <div className="ag-orders-board-header">
            <div>
              <h2>Pedidos de Todas as Service Lines</h2>
              <p>Filtrar por:</p>
            </div>

            <div className="ag-orders-filter-row">
              {tableFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`ag-filter-chip ${activeFilters.includes(filter.id) ? 'active' : 'inactive'} ${filter.id}`}
                  onClick={() => toggleFilter(filter.id)}
                  aria-pressed={activeFilters.includes(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ag-orders-table-wrap">
            <table className="ag-orders-table">
              <thead>
                <tr>
                  <th>Nome do Consultor</th>
                  <th>Service Line</th>
                  <th>Badge Pedida</th>
                  <th>Nível</th>
                  <th>
                    <span className="ag-orders-sort-head">
                      Data do Pedido <ArrowDown size={12} aria-hidden="true" />
                    </span>
                  </th>
                  <th>Estado Final</th>
                  <th>Ação do Admin</th>
                </tr>
              </thead>

              <tbody>
                {pagedRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="ag-orders-empty-row">
                      Sem pedidos para os filtros escolhidos.
                    </td>
                  </tr>
                )}

                {pagedRequests.map((request) => {
                  const statusClass = tableStatusStyles[request.tableStatus] || 'pending';
                  const isPending = request.tableStatus === 'pendente';

                  return (
                    <tr key={request.id}>
                      <td>
                        <div className="ag-consultant-cell">
                          <Users size={16} />
                          <span>{request.consultant}</span>
                        </div>
                      </td>
                      <td>{request.serviceLine}</td>
                      <td>{request.badge}</td>
                      <td>{request.level}</td>
                      <td>{request.date}</td>

                      <td>
                        <span className={`ag-status-pill ${statusClass}`}>
                          {getTableLabel(request.tableStatus)}
                        </span>
                      </td>

                      <td>
                        <div className="ag-action-cell">
                          <button
                            type="button"
                            className="ag-view-btn"
                            onClick={() => openRequestDetails(request.id)}
                          >
                            <Eye size={14} />
                            Ver
                          </button>

                          {isPending ? (
                            <div className="ag-orders-actions">
                              <button
                                type="button"
                                className="ag-action-btn approve"
                                onClick={() => decideRequest(request.id, 'aprovado')}
                              >
                                <Check size={14} />
                                Aprovar
                              </button>

                              <button
                                type="button"
                                className="ag-action-btn reject"
                                onClick={() => decideRequest(request.id, 'rejeitado')}
                              >
                                <X size={14} />
                                Rejeitar
                              </button>
                            </div>
                          ) : (
                            <div className="ag-finalized-note">
                              <strong>Finalizado</strong>
                              <span>{`${request.finalReviewer || adminName} • ${request.finalDate || '-'}`}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="ag-orders-pagination" role="navigation" aria-label="Paginação de pedidos">
            <button type="button" className="ag-page-btn ghost" onClick={previousPage} disabled={safePage === 1}>
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`ag-page-btn ${pageNumber === safePage ? 'active' : ''}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button type="button" className="ag-page-btn ghost" onClick={nextPage} disabled={safePage === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        {selectedRequest && (
          <div className="ag-request-modal-overlay" role="dialog" aria-modal="true" aria-label="Detalhes do pedido">
            <div className="ag-request-modal">
              <header className="ag-request-modal-header">
                <div>
                  <h2>Detalhes do Pedido</h2>
                  <p>{selectedRequest.consultant} · {selectedRequest.badge}</p>
                </div>

                <button
                  type="button"
                  className="ag-request-modal-close"
                  onClick={closeRequestDetails}
                  aria-label="Fechar detalhes"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="ag-request-modal-content">
                <section className="ag-request-modal-card">
                  <h3>
                    <FileText size={16} />
                    Pedido
                  </h3>

                  <ul className="ag-request-modal-list">
                    <li><strong>Consultor:</strong> {selectedRequest.consultant}</li>
                    <li><strong>Service Line:</strong> {selectedRequest.serviceLine}</li>
                    <li><strong>Badge:</strong> {selectedRequest.badge}</li>
                    <li><strong>Nível:</strong> {selectedRequest.level}</li>
                    <li><strong>Data:</strong> {selectedRequest.date}</li>
                  </ul>
                </section>

                <section className="ag-request-modal-card">
                  <h3>
                    <CalendarDays size={16} />
                    Estado atual
                  </h3>

                  <span className={`ag-status-pill ${tableStatusStyles[selectedRequest.tableStatus] || 'pending'}`}>
                    {getTableLabel(selectedRequest.tableStatus)}
                  </span>
                </section>

                <section className="ag-request-modal-card">
                  <h3>
                    <MessageSquare size={16} />
                    Mensagem do Talent Manager
                  </h3>

                  {selectedRequestTmReview ? (
                    <div className="ag-request-modal-message-block">
                      <div className="ag-request-modal-meta">
                        <strong>{selectedRequestTmReview.reviewer}</strong>
                        <span>{selectedRequestTmReview.reviewedDate}</span>
                      </div>
                      <p>{selectedRequestTmReview.message}</p>
                    </div>
                  ) : (
                    <p className="ag-request-modal-empty">
                      Este pedido ainda não foi avaliado pelo Talent Manager.
                    </p>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default GestaoPedidosAG;