import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import '../../css/Consultor/Notificacoes.css';

const notificationTypes = [
  { id: 'todos', labelKey: 'notifications_filter_all' },
  { id: 'alerta', labelKey: 'notifications_filter_alert' },
  { id: 'info', labelKey: 'notifications_filter_info' },
  { id: 'sucesso', labelKey: 'notifications_filter_success' },
];

const sortOptions = [
  { id: 'recentes', labelKey: 'notifications_sort_recent' },
  { id: 'antigas', labelKey: 'notifications_sort_oldest' },
  { id: 'titulo_asc', labelKey: 'notifications_sort_title_asc' },
];

const defaultNotifications = [
  {
    id: 'notif-1',
    typeId: 'alerta',
    title: 'LowCode (Outsystems) sera removido',
    sender: 'Maria Santos',
    date: '2025-04-20',
    summary: 'A badge LowCode (Outsystems) foi marcada para remocao no proximo ciclo.',
    accent: '#f4c20d',
    details: [
      'A badge LowCode (Outsystems) sera removida do fluxo atual durante a proxima atualizacao.',
      'Recomenda-se rever o estado das candidaturas e guardar as evidencias necessarias.',
    ],
  },
  {
    id: 'notif-2',
    typeId: 'info',
    title: 'Novo nivel adicionado a LowCode (Outsystems)',
    sender: 'Maria Santos',
    date: '2025-04-15',
    summary: 'Foi adicionado um novo nivel ao percurso de badges.',
    accent: '#1f8fe5',
    details: [
      'Foi adicionado um novo nivel ao percurso de LowCode (Outsystems).',
      'Consulte a pagina de badges para ver os novos requisitos e o detalhe da candidatura.',
    ],
  },
  {
    id: 'notif-3',
    typeId: 'sucesso',
    title: 'Pedido aprovado',
    sender: 'Maria Santos',
    date: '2025-03-30',
    summary: 'A tua candidatura foi aprovada com sucesso.',
    accent: '#4cd07d',
    details: [
      'A candidatura submetida foi validada e aprovada pela equipa responsavel.',
      'Podes consultar os detalhes do badge na area de Meus Badges.',
    ],
  },
  {
    id: 'notif-4',
    typeId: 'info',
    title: 'Ranking mensal atualizado',
    sender: 'Ranking Team',
    date: '2025-03-22',
    summary: 'A lista de ranking recebeu novos pontos e badges.',
    accent: '#9851e8',
    details: [
      'O ranking mensal foi atualizado com os dados mais recentes da plataforma.',
      'Verifica a tua posicao e as mudancas introduzidas pela nova campanha.',
    ],
  },
  {
    id: 'notif-5',
    typeId: 'alerta',
    title: 'Badge expirando em breve',
    sender: 'Sistema',
    date: '2025-03-18',
    summary: 'Existe uma badge com expiracao iminente.',
    accent: '#ef4444',
    details: [
      'Uma das badges ativas esta a aproximar-se da data de expiracao.',
      'Revise as informacoes e revalide a candidatura, se necessario.',
    ],
  },
  {
    id: 'notif-6',
    typeId: 'info',
    title: 'Manutencao programada',
    sender: 'IT Operations',
    date: '2025-03-12',
    summary: 'Havera uma janela de manutencao com indisponibilidade temporaria.',
    accent: '#3b82f6',
    details: [
      'Durante a janela de manutencao, algumas funcionalidades podem ficar temporariamente indisponiveis.',
      'Planeie a sua atividade de acordo com esta janela de operacao.',
    ],
  },
];

const ITEMS_PER_PAGE = 10;

const formatNotificationDate = (value, locale = 'pt-PT') => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

function Notificacoes() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [notifications] = useState(defaultNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('recentes');
  const [page, setPage] = useState(1);
  const [selectedNotificationId, setSelectedNotificationId] = useState(defaultNotifications[0].id);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }

      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/consultor/dashboard');
  };

  const filters = useMemo(() => notificationTypes, []);

  const activeFilterLabel = filters.find((item) => item.id === activeFilter)
    ? t(filters.find((item) => item.id === activeFilter).labelKey)
    : t('notifications_filter_all');

  const activeSortLabel = sortOptions.find((item) => item.id === sortBy)
    ? t(sortOptions.find((item) => item.id === sortBy).labelKey)
    : t('notifications_sort_recent');

  const hasActiveFilter = activeFilter !== 'todos';
  const hasActiveSort = sortBy !== 'recentes';

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notifications.filter((notification) => {
      const typeMatch = activeFilter === 'todos' || notification.typeId === activeFilter;
      const searchMatch =
        normalizedSearch.length === 0
        || notification.title.toLowerCase().includes(normalizedSearch)
        || notification.sender.toLowerCase().includes(normalizedSearch)
        || notification.summary.toLowerCase().includes(normalizedSearch)
        || notification.details.some((detail) => detail.toLowerCase().includes(normalizedSearch));

      return typeMatch && searchMatch;
    });
  }, [notifications, activeFilter, searchTerm]);

  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort((a, b) => {
      if (sortBy === 'antigas') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      if (sortBy === 'titulo_asc') {
        return a.title.localeCompare(b.title);
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredNotifications, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedNotifications.length / ITEMS_PER_PAGE));

  const pagedNotifications = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedNotifications.slice(start, end);
  }, [sortedNotifications, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilter, sortBy]);

  useEffect(() => {
    if (!pagedNotifications.length) {
      setSelectedNotificationId(null);
      return;
    }

    if (!selectedNotificationId || !pagedNotifications.some((notification) => notification.id === selectedNotificationId)) {
      setSelectedNotificationId(pagedNotifications[0].id);
    }
  }, [pagedNotifications, selectedNotificationId]);

  const selectedNotification = sortedNotifications.find((notification) => notification.id === selectedNotificationId) || sortedNotifications[0] || notifications[0];

  const onPagePrev = () => setPage((current) => Math.max(1, current - 1));
  const onPageNext = () => setPage((current) => Math.min(totalPages, current + 1));

  return (
    <Layout>
      <div className="notifications-page">
        <header className="notifications-header">
          <button type="button" className="notifications-back-btn" onClick={handleGoBack} aria-label={t('back')}>
            <ArrowLeft size={22} />
          </button>
          <h1>{t('notifications_title')}</h1>
        </header>

        <section className="notifications-shell">
          <div className="notifications-toolbar">
            <label className="notifications-search-wrap" htmlFor="notifications-search-input">
              <Search size={20} />
              <input
                id="notifications-search-input"
                type="text"
                placeholder={t('notifications_search_placeholder')}
                aria-label={t('notifications_search_placeholder')}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="notifications-control-group" ref={filterDropdownRef}>
              <button
                type="button"
                className={`notifications-control-btn ${showFilterDropdown || hasActiveFilter ? 'active' : ''}`}
                onClick={() => {
                  setShowFilterDropdown((current) => !current);
                  setShowSortDropdown(false);
                }}
              >
                <Filter size={18} />
                <span className="notifications-control-btn-label">{`${t('notifications_filter_label')}: ${activeFilterLabel}`}</span>
              </button>

              {showFilterDropdown && (
                <div className="notifications-dropdown-menu" aria-label={t('notifications_filter_label')}>
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={`notifications-dropdown-item ${activeFilter === filter.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveFilter(filter.id);
                        setShowFilterDropdown(false);
                      }}
                    >
                      {t(filter.labelKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="notifications-control-group" ref={sortDropdownRef}>
              <button
                type="button"
                className={`notifications-control-btn ${showSortDropdown || hasActiveSort ? 'active' : ''}`}
                onClick={() => {
                  setShowSortDropdown((current) => !current);
                  setShowFilterDropdown(false);
                }}
              >
                <SlidersHorizontal size={18} />
                <span className="notifications-control-btn-label">{`${t('notifications_sort_label')}: ${activeSortLabel}`}</span>
              </button>

              {showSortDropdown && (
                <div className="notifications-dropdown-menu" aria-label={t('notifications_sort_label')}>
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`notifications-dropdown-item ${sortBy === option.id ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(option.id);
                        setShowSortDropdown(false);
                      }}
                    >
                      {t(option.labelKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="notifications-grid">
            <aside className="notifications-list-panel">
              <div className="notifications-panel-head">
                <h2>{t('notifications_table_title')}</h2>
                <span>{sortedNotifications.length} {t('notifications_items_label')}</span>
              </div>

              <div className="notifications-table-wrap">
                <table className="notifications-table">
                  <thead>
                    <tr>
                      <th>{t('notifications_column_title')}</th>
                      <th>{t('notifications_column_sender')}</th>
                      <th>
                        <span className="notifications-sort-indicator">{t('notifications_column_date')}</span>
                      </th>
                      <th>{t('notifications_column_details')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedNotifications.map((notification) => {
                      const isSelected = notification.id === selectedNotificationId;

                      return (
                        <tr key={notification.id} className={isSelected ? 'selected' : ''}>
                          <td>
                            <button type="button" className="notifications-row-link" onClick={() => setSelectedNotificationId(notification.id)}>
                              {notification.title}
                            </button>
                          </td>
                          <td>{notification.sender}</td>
                          <td>{formatNotificationDate(notification.date, i18n.language === 'en' ? 'en-GB' : 'pt-PT')}</td>
                          <td>
                            <button type="button" className="notifications-view-btn" onClick={() => setSelectedNotificationId(notification.id)}>
                              {t('notifications_view_button')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="notifications-pagination" role="navigation" aria-label={t('pagination')}>
                <button type="button" className="notifications-page-btn ghost" onClick={onPagePrev} disabled={page === 1} aria-label={t('previous_page')}>
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`notifications-page-btn ${pageNumber === page ? 'active' : ''}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button type="button" className="notifications-page-btn ghost" onClick={onPageNext} disabled={page === totalPages} aria-label={t('next_page')}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </aside>

            <section className="notifications-detail-panel">
              {selectedNotification ? (
                <div className="notification-detail-card">
                  <div className="notification-detail-badge" style={{ backgroundColor: `${selectedNotification.accent}18`, color: selectedNotification.accent }}>
                    {selectedNotification.title}
                  </div>

                  <div className="notification-detail-meta">
                    <span>{selectedNotification.sender}</span>
                    <span>{formatNotificationDate(selectedNotification.date, i18n.language === 'en' ? 'en-GB' : 'pt-PT')}</span>
                  </div>

                  <div className="notification-detail-body">
                    {selectedNotification.details.map((paragraph, index) => (
                      <p key={`${selectedNotification.id}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="notifications-empty-state">{t('notifications_empty_state')}</div>
              )}
            </section>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Notificacoes;