import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
} from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/AdminGestor/GestaoPedidos_AG.css';
import { requestRows, statusConfig } from './adminGestorRequestsData';

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

function GestaoPedidosAG() {
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
      {
        id: 'submitted',
        tone: statusConfig.submetido.tone,
        label: statusConfig.submetido.label,
        value: summaryCounts.submitted,
        icon: statusConfig.submetido.icon,
      },
      {
        id: 'inReview',
        tone: statusConfig.validacao.tone,
        label: statusConfig.validacao.label,
        value: summaryCounts.inReview,
        icon: statusConfig.validacao.icon,
      },
      {
        id: 'rejected',
        tone: statusConfig.rejeitado.tone,
        label: statusConfig.rejeitado.label,
        value: summaryCounts.rejected,
        icon: statusConfig.rejeitado.icon,
      },
      {
        id: 'approved',
        tone: statusConfig.aprovado.tone,
        label: statusConfig.aprovado.label,
        value: summaryCounts.approved,
        icon: statusConfig.aprovado.icon,
      },
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
              <h2>Pedidos de Todos os Consultores</h2>
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
                  <th>Badge Pedida</th>
                  <th>Nível</th>
                  <th>
                    <span className="ag-orders-sort-head">
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
                    <td colSpan={6} className="ag-orders-empty-row">
                      Sem pedidos para os filtros escolhidos.
                    </td>
                  </tr>
                )}

                {pagedRequests.map((request) => {
                  const statusClass = tableStatusStyles[request.tableStatus] || 'pending';

                  return (
                    <tr key={request.id}>
                      <td>
                        <div className="ag-consultant-cell">
                          <Users size={16} />
                          <span>{request.consultant}</span>
                        </div>
                      </td>
                      <td>{request.badge}</td>
                      <td>{request.level}</td>
                      <td>{request.date}</td>
                      <td>
                        <span className={`ag-status-pill ${statusClass}`}>
                          {getTableLabel(request.tableStatus)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="ag-view-btn"
                          onClick={() => navigate(`/admin-gestor/pedidos/${request.id}`)}
                        >
                          <Eye size={14} />
                          Ver
                        </button>
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
      </div>
    </Layout>
  );
}

export default GestaoPedidosAG;