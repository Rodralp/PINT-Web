import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/ServiceLineLeader/GestaoPedidos_SLL.css';
import { requestRows, statusConfig } from '../../data/requests/serviceLineLeaderRequestsData';

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

const getTableLabel = (tableStatus) => {
  if (tableStatus === 'aprovado') {
    return 'Aprovado';
  }

  if (tableStatus === 'rejeitado') {
    return 'Rejeitado';
  }

  return 'Pendente';
};

function GestaoPedidosSLL() {
  const navigate = useNavigate();
  const [requests] = useState(requestRows);
  const [activeFilters, setActiveFilters] = useState(tableFilters.map((filter) => filter.id));
  const [page, setPage] = useState(1);

  const summaryCounts = useMemo(
    () => ({
      submitted: requests.length,
      inReview: requests.filter((request) => request.status === 'validacao').length,
      rejected: requests.filter((request) => request.status === 'rejeitado').length,
      approved: requests.filter((request) => request.status === 'aprovado').length,
    }),
    [requests],
  );

  const summaryCards = useMemo(
    () => [
      { id: 'submitted', label: statusConfig.submetido.label, tone: statusConfig.submetido.tone, icon: statusConfig.submetido.icon, value: summaryCounts.submitted },
      { id: 'inReview', label: statusConfig.validacao.label, tone: statusConfig.validacao.tone, icon: statusConfig.validacao.icon, value: summaryCounts.inReview },
      { id: 'rejected', label: statusConfig.rejeitado.label, tone: statusConfig.rejeitado.tone, icon: statusConfig.rejeitado.icon, value: summaryCounts.rejected },
      { id: 'approved', label: statusConfig.aprovado.label, tone: statusConfig.aprovado.tone, icon: statusConfig.aprovado.icon, value: summaryCounts.approved },
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

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/service-line-leader/dashboard');
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

  const previousPage = () => setPage((current) => Math.max(1, current - 1));
  const nextPage = () => setPage((current) => Math.min(totalPages, current + 1));

  return (
    <Layout>
      <div className="sll-orders-page">
        <header className="sll-orders-header">
          <button type="button" className="sll-orders-back-btn" onClick={handleGoBack} aria-label="Voltar">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1>Gestão de Pedidos</h1>
          </div>
        </header>

        <section className="sll-orders-summary-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.id} className={`sll-request-card ${card.tone}`}>
                <span className="sll-request-card-icon">
                  <Icon size={26} strokeWidth={2} />
                </span>
                <div className="sll-request-card-content">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </div>
              </article>
            );
          })}
        </section>

        <section className="sll-orders-main-card">
          <div className="sll-orders-board-header">
            <div>
              <h2>Pedidos de Todos os Consultores</h2>
              <p>Filtrar por:</p>
            </div>

            <div className="sll-orders-filter-row">
              {tableFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`sll-filter-chip ${activeFilters.includes(filter.id) ? 'active' : 'inactive'} ${filter.id}`}
                  onClick={() => toggleFilter(filter.id)}
                  aria-pressed={activeFilters.includes(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sll-orders-table-wrap">
            <table className="sll-orders-table">
              <thead>
                <tr>
                  <th>Nome do Consultor</th>
                  <th>Badge Pedida</th>
                  <th>Nível</th>
                  <th>
                    <span className="sll-orders-sort-head">
                      Data do Pedido <ArrowDown size={12} aria-hidden="true" />
                    </span>
                  </th>
                  <th>Estado do Pedido</th>
                  <th>Detalhes do Pedido</th>
                </tr>
              </thead>
              <tbody>
                {pagedRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="sll-orders-empty-row">
                      Sem pedidos para os filtros escolhidos.
                    </td>
                  </tr>
                )}

                {pagedRequests.map((request) => {
                  const statusClass = tableStatusStyles[request.tableStatus] || 'pending';

                  return (
                    <tr key={request.id}>
                      <td>{request.consultant}</td>
                      <td>{request.badge}</td>
                      <td>{request.level}</td>
                      <td>{request.date}</td>
                      <td>
                        <span className={`sll-status-pill ${statusClass}`}>
                          {getTableLabel(request.tableStatus)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="sll-view-btn"
                          onClick={() => navigate(`/service-line-leader/pedidos/${request.id}`)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="sll-orders-pagination" role="navigation" aria-label="Paginação de pedidos">
            <button type="button" className="sll-page-btn ghost" onClick={previousPage} disabled={safePage === 1}>
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`sll-page-btn ${pageNumber === safePage ? 'active' : ''}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button type="button" className="sll-page-btn ghost" onClick={nextPage} disabled={safePage === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default GestaoPedidosSLL;
