import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import Layout from '../../components/Layout';
import {
  fetchHistoricoAreasSLL,
  fetchHistoricoBadgesSLL,
  fetchHistoricoConsultoresSLL,
  fetchDetalhesConsultorSLL,
  fetchDetalhesBadgeSLL,
} from '../../services/serviceLineLeaderService';
import '../../css/TalentManager/Exportacoes_TM.css';
import '../../css/Shared/HistoricoPages.css';

const tabs = [
  { id: 'minha-sl', label: 'Minha Service Line' },
  { id: 'badges', label: 'Badges' },
  { id: 'consultores', label: 'Consultores' },
];

const ITEMS_PER_PAGE = 10;

const getStoredLoginData = () => {
  const storedLoginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');
  if (!storedLoginData) return null;
  try {
    return JSON.parse(storedLoginData);
  } catch {
    return null;
  }
};

const normalizeLevelTitle = (value) => {
  const raw = String(value || '').trim();
  if (!raw) {
    return '-';
  }

  if (raw.includes(' - ')) {
    const suffix = raw.split(' - ').slice(1).join(' - ').trim();
    if (suffix) {
      return suffix;
    }
  }

  return raw.replace(/^nivel\s+/i, '').trim() || raw;
};

function HistoricoSLL() {
  const loginData = useMemo(() => getStoredLoginData(), []);
  const [activeTab, setActiveTab] = useState('minha-sl');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [serviceLineData, setServiceLineData] = useState(null);
  const [areas, setAreas] = useState([]);
  const [badges, setBadges] = useState([]);
  const [consultores, setConsultores] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const accountId = Number(loginData?.id);
      if (!Number.isInteger(accountId) || accountId <= 0) {
        setErrorMessage('Não foi possível identificar o utilizador autenticado.');
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const [slData, bData, cData] = await Promise.all([
          fetchHistoricoAreasSLL(accountId).catch(() => ({ serviceLine: null, areas: [] })),
          fetchHistoricoBadgesSLL(accountId).catch(() => []),
          fetchHistoricoConsultoresSLL(accountId).catch(() => []),
        ]);

        if (isMounted) {
          setServiceLineData(slData?.serviceLine || null);
          setAreas(Array.isArray(slData?.areas) ? slData.areas : []);
          setBadges(Array.isArray(bData) ? bData : []);
          setConsultores(Array.isArray(cData) ? cData : []);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error?.message || 'Erro ao carregar dados.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [loginData]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (activeTab === 'minha-sl') {
      return areas.filter((item) => item.name?.toLowerCase().includes(query));
    }

    if (activeTab === 'badges') {
      return badges.filter((item) =>
        item.name?.toLowerCase().includes(query)
        || item.area?.toLowerCase().includes(query)
        || item.level?.toLowerCase().includes(query),
      );
    }

    if (activeTab === 'consultores') {
      return consultores.filter((item) =>
        item.name?.toLowerCase().includes(query)
        || item.email?.toLowerCase().includes(query),
      );
    }

    return [];
  }, [activeTab, searchQuery, areas, badges, consultores]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const pagedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredData.slice(start, end);
  }, [filteredData, page]);

  const previousPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  const openModal = async (type, id) => {
    const accountId = Number(loginData?.id);
    if (!Number.isInteger(accountId) || accountId <= 0) return;

    setModalType(type);
    setModalOpen(true);
    setModalLoading(true);

    try {
      let data;
      if (type === 'consultor') {
        data = await fetchDetalhesConsultorSLL(accountId, id);
      } else if (type === 'badge') {
        data = await fetchDetalhesBadgeSLL(accountId, id);
      }
      setModalData(data);
    } catch {
      setModalData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setModalData(null);
  };

  const renderStatusBadge = (status) => {
    const statusClasses = {
      completo: 'status-badge success',
      'a-fazer': 'status-badge warning',
      pendente: 'status-badge warning',
      ativo: 'status-badge success',
      inativo: 'status-badge danger',
      rejeitado: 'status-badge danger',
    };
    const normalizedStatus = String(status || '').trim().toLowerCase();
    const mappedStatus = ['pendente-tm', 'pendente-sll'].includes(normalizedStatus)
      ? 'pendente'
      : normalizedStatus;
    const className = statusClasses[mappedStatus] || 'status-badge';
    return <span className={className}>{mappedStatus || '-'}</span>;
  };

  return (
    <Layout>
      <div className="tm-export-page historico-page">
        <header className="tm-export-header">
          <h1>Histórico da Service Line</h1>
        </header>

        <p className="tm-export-scope-note">
          Acompanhe o desempenho e a evolução dos consultores da sua Service Line.
        </p>

        <div className="tm-export-shell">
          <div className="tm-export-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tm-export-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab !== 'minha-sl' && (
            <div className="tm-export-toolbar historico-toolbar-single">
              <div className="tm-export-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {isLoading && <p className="lp-progress-label">A carregar...</p>}
          {errorMessage && <p className="lp-progress-label">{errorMessage}</p>}

          {!isLoading && !errorMessage && (
            <>
              {activeTab === 'minha-sl' && (
                <>
                  <div className="orders-table-wrap">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Service Line</th>
                          <th>Total Badges</th>
                          <th>Obtidas</th>
                          <th>Em Progresso</th>
                          <th>Consultores</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!serviceLineData && (
                          <tr>
                            <td colSpan={5} className="orders-empty-row">Service Line não encontrada.</td>
                          </tr>
                        )}
                        {serviceLineData && (
                          <tr>
                            <td><strong>{serviceLineData.name}</strong></td>
                            <td>{serviceLineData.totalBadges || 0}</td>
                            <td>{serviceLineData.obtidas || 0}</td>
                            <td>{serviceLineData.emProgresso || 0}</td>
                            <td>{serviceLineData.totalConsultores || 0}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <h3 className="historico-section-title">Áreas da Service Line</h3>
                  <div className="orders-table-wrap">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Área</th>
                          <th>Total Badges</th>
                          <th>Obtidas</th>
                          <th>Em Progresso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedData.length === 0 && (
                          <tr>
                            <td colSpan={4} className="orders-empty-row">Nenhuma área encontrada.</td>
                          </tr>
                        )}
                        {pagedData.map((item) => (
                          <tr key={item.id}>
                            <td><strong>{item.name}</strong></td>
                            <td>{item.totalBadges || 0}</td>
                            <td>{item.obtidas || 0}</td>
                            <td>{item.emProgresso || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeTab === 'badges' && (
                <div className="orders-table-wrap">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Badge</th>
                        <th>Área</th>
                        <th>Nível</th>
                        <th>Consultores Obtidos</th>
                        <th>Em Progresso</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedData.length === 0 && (
                        <tr>
                          <td colSpan={6} className="orders-empty-row">Nenhum badge encontrado.</td>
                        </tr>
                      )}
                      {pagedData.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.area || '-'}</td>
                          <td>{normalizeLevelTitle(item.level)}</td>
                          <td>{item.consultoresObtidos || 0}</td>
                          <td>{item.emProgresso || 0}</td>
                          <td>
                            <button
                              type="button"
                              className="tm-export-control-btn historico-action-btn"
                              onClick={() => openModal('badge', item.id)}
                            >
                              <Eye size={16} />
                              Ver mais
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'consultores' && (
                <div className="orders-table-wrap">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Consultor</th>
                        <th>Email</th>
                        <th>Pontos</th>
                        <th>Badges Obtidas</th>
                        <th>Em Progresso</th>
                        <th>Estado</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedData.length === 0 && (
                        <tr>
                          <td colSpan={7} className="orders-empty-row">Nenhum consultor encontrado.</td>
                        </tr>
                      )}
                      {pagedData.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="consultant-cell">
                              <img
                                src={item.avatar || `https://i.pravatar.cc/120?u=${item.email}`}
                                alt={item.name}
                                className="consultant-avatar-small"
                              />
                              <strong>{item.name}</strong>
                            </div>
                          </td>
                          <td>{item.email}</td>
                          <td>{item.points || 0}</td>
                          <td>{item.badgesObtidas || 0}</td>
                          <td>{item.badgesEmProgresso || 0}</td>
                          <td>{renderStatusBadge(item.status)}</td>
                          <td>
                            <button
                              type="button"
                              className="tm-export-control-btn historico-action-btn"
                              onClick={() => openModal('consultor', item.id)}
                            >
                              <Eye size={16} />
                              Ver mais
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredData.length > 0 && (
                <div className="orders-pagination" role="navigation">
                  <button
                    type="button"
                    className="orders-page-btn ghost"
                    onClick={previousPage}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`orders-page-btn ${pageNumber === page ? 'active' : ''}`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="orders-page-btn ghost"
                    onClick={nextPage}
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

          {modalOpen && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>
                    {modalType === 'consultor' && 'Detalhes do Consultor'}
                    {modalType === 'badge' && 'Detalhes do Badge'}
                  </h2>
                  <button type="button" className="modal-close" onClick={closeModal}>
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-body">
                  {modalLoading && <p>A carregar...</p>}
                  {!modalLoading && modalData && (
                    <>
                      {modalType === 'consultor' && modalData.consultor && (
                        <div className="modal-section">
                          <div className="modal-info">
                            <h3>{modalData.consultor.name}</h3>
                            <p>{modalData.consultor.email}</p>
                            <p><strong>Total de Pontos:</strong> {modalData.consultor.totalPoints}</p>
                          </div>
                          <h4>Badges Obtidos ({modalData.badgesObtidos?.length || 0})</h4>
                          {modalData.badgesObtidos?.length > 0 ? (
                            <table className="orders-table">
                              <thead>
                                <tr>
                                  <th>Badge</th>
                                  <th>Área</th>
                                  <th>Service Line</th>
                                  <th>Pontos</th>
                                  <th>Data</th>
                                </tr>
                              </thead>
                              <tbody>
                                {modalData.badgesObtidos.map((badge) => (
                                  <tr key={badge.id}>
                                    <td>{badge.name}</td>
                                    <td>{badge.areaName || '-'}</td>
                                    <td>{badge.serviceLineName || '-'}</td>
                                    <td>{badge.points}</td>
                                    <td>{badge.obtainedDate ? new Date(badge.obtainedDate).toLocaleDateString() : '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>Nenhum badge obtido.</p>
                          )}
                          <h4 style={{ marginTop: '20px' }}>Badges em Progresso ({modalData.badgesEmProgresso?.length || 0})</h4>
                          {modalData.badgesEmProgresso?.length > 0 ? (
                            <table className="orders-table">
                              <thead>
                                <tr>
                                  <th>Badge</th>
                                  <th>Área</th>
                                  <th>Service Line</th>
                                  <th>Estado</th>
                                  <th>Data Pedido</th>
                                </tr>
                              </thead>
                              <tbody>
                                {modalData.badgesEmProgresso.map((badge) => (
                                  <tr key={badge.id}>
                                    <td>{badge.name}</td>
                                    <td>{badge.areaName || '-'}</td>
                                    <td>{badge.serviceLineName || '-'}</td>
                                    <td>{renderStatusBadge(badge.status)}</td>
                                    <td>{badge.requestDate ? new Date(badge.requestDate).toLocaleDateString() : '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>Nenhum badge em progresso.</p>
                          )}
                        </div>
                      )}

                      {modalType === 'badge' && modalData.badge && (
                        <div className="modal-section">
                          <div className="modal-info">
                            <h3>{modalData.badge.name}</h3>
                            <p><strong>Área:</strong> {modalData.badge.areaName || '-'}</p>
                            <p><strong>Service Line:</strong> {modalData.badge.serviceLineName || '-'}</p>
                            <p><strong>Nível:</strong> {normalizeLevelTitle(modalData.badge.level)}</p>
                            <p><strong>Pontos:</strong> {modalData.badge.points}</p>
                          </div>
                          <h4>Consultores que Obtiveram ({modalData.totalObtidos})</h4>
                          {modalData.consultoresObtidos?.length > 0 ? (
                            <table className="orders-table">
                              <thead>
                                <tr>
                                  <th>Consultor</th>
                                  <th>Email</th>
                                  <th>Data</th>
                                </tr>
                              </thead>
                              <tbody>
                                {modalData.consultoresObtidos.map((c) => (
                                  <tr key={c.id}>
                                    <td>{c.name}</td>
                                    <td>{c.email}</td>
                                    <td>{c.obtainedDate ? new Date(c.obtainedDate).toLocaleDateString() : '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>Nenhum consultor obteve este badge.</p>
                          )}
                          <h4 style={{ marginTop: '20px' }}>Consultores em Progresso ({modalData.totalEmProgresso})</h4>
                          {modalData.consultoresEmProgresso?.length > 0 ? (
                            <table className="orders-table">
                              <thead>
                                <tr>
                                  <th>Consultor</th>
                                  <th>Email</th>
                                  <th>Estado</th>
                                  <th>Data Pedido</th>
                                </tr>
                              </thead>
                              <tbody>
                                {modalData.consultoresEmProgresso.map((c) => (
                                  <tr key={c.id}>
                                    <td>{c.name}</td>
                                    <td>{c.email}</td>
                                    <td>{renderStatusBadge(c.status)}</td>
                                    <td>{c.requestDate ? new Date(c.requestDate).toLocaleDateString() : '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>Nenhum consultor em progresso.</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default HistoricoSLL;
