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

const notificationTypeLabels = {
  alerta: 'notifications_filter_alert',
  info: 'notifications_filter_info',
  sucesso: 'notifications_filter_success',
};

const defaultNotifications = [
  {
    id: 'notif-1',
    typeId: 'alerta',
    isRead: false,
    title: 'LowCode (Outsystems) sera removido',
    date: '2025-04-20',
    summary: 'A badge LowCode (Outsystems) foi marcada para remocao no proximo ciclo.',
    accent: '#f4c20d',
    actionPath: '/consultor/catalogo-badges',
  },
  {
    id: 'notif-2',
    typeId: 'info',
    isRead: true,
    title: 'Novo nivel adicionado a LowCode (Outsystems)',
    date: '2025-04-15',
    summary: 'Foi adicionado um novo nivel ao percurso de badges.',
    accent: '#1f8fe5',
    actionPath: '/consultor/catalogo-badges',
  },
  {
    id: 'notif-3',
    typeId: 'sucesso',
    isRead: true,
    title: 'Pedido aprovado',
    date: '2025-03-30',
    summary: 'A tua candidatura foi aprovada com sucesso.',
    accent: '#4cd07d',
    actionPath: '/consultor/meus-badges',
  },
  {
    id: 'notif-4',
    typeId: 'info',
    isRead: false,
    title: 'Ranking mensal atualizado',
    date: '2025-03-22',
    summary: 'A lista de ranking recebeu novos pontos e badges.',
    accent: '#9851e8',
    actionPath: '/consultor/ranking',
  },
  {
    id: 'notif-5',
    typeId: 'alerta',
    isRead: false,
    title: 'Badge expirando em breve',
    date: '2025-03-18',
    summary: 'Existe uma badge com expiracao iminente.',
    accent: '#ef4444',
    actionPath: '/consultor/meus-badges',
  },
  {
    id: 'notif-6',
    typeId: 'info',
    isRead: true,
    title: 'Manutencao programada',
    date: '2025-03-12',
    summary: 'Havera uma janela de manutencao com indisponibilidade temporaria.',
    accent: '#3b82f6',
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
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('recentes');
  const [page, setPage] = useState(1);
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
        || notification.summary.toLowerCase().includes(normalizedSearch)
        || t(notificationTypeLabels[notification.typeId] || 'notifications_filter_all').toLowerCase().includes(normalizedSearch);

      return typeMatch && searchMatch;
    });
  }, [notifications, activeFilter, searchTerm, t]);

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
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleOpenNotification = (notification) => {
    if (!notification.isRead) {
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, isRead: true } : item
      )));
    }

    if (!notification.actionPath) {
      return;
    }

    navigate(notification.actionPath);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications((current) => current.map((item) => (
      item.id === notificationId ? { ...item, isRead: true } : item
    )));
  };

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

          <div className="notifications-column">
            <div className="notifications-panel-head">
              <h2>{t('notifications_table_title')}</h2>
              <span>{sortedNotifications.length} {t('notifications_items_label')}</span>
            </div>

            <div className="notifications-table-wrap">
              <table className="notifications-table">
                <thead>
                  <tr>
                    <th className="notifications-col-seen">{t('notifications_column_seen')}</th>
                    <th>{t('notifications_column_title')}</th>
                    <th>{t('notifications_column_sender')}</th>
                    <th>{t('notifications_column_date')}</th>
                    <th>{t('notifications_column_details')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedNotifications.map((notification) => {
                    const canOpen = Boolean(notification.actionPath);

                    return (
                      <tr key={notification.id}>
                        <td>
                          {notification.isRead ? (
                            <span
                              className={`notifications-seen-indicator ${notification.isRead ? 'is-read' : 'is-unread'}`}
                              aria-label={t('notifications_seen_read')}
                              title={t('notifications_seen_read')}
                            />
                          ) : (
                            <button
                              type="button"
                              className="notifications-seen-btn"
                              onClick={() => handleMarkAsRead(notification.id)}
                              aria-label={t('notifications_seen_unread')}
                              title={t('notifications_seen_unread')}
                            >
                              <span className="notifications-seen-indicator is-unread" />
                            </button>
                          )}
                        </td>
                        <td>
                          <div className="notification-table-title-wrap">
                            <span className="notification-table-title">{notification.title}</span>
                            <span className="notification-table-summary">{notification.summary}</span>
                          </div>
                        </td>
                        <td>
                          <span className="notification-table-badge" style={{ backgroundColor: `${notification.accent}18`, color: notification.accent }}>
                            {t(notificationTypeLabels[notification.typeId] || 'notifications_filter_all')}
                          </span>
                        </td>
                        <td>{formatNotificationDate(notification.date, i18n.language === 'en' ? 'en-GB' : 'pt-PT')}</td>
                        <td>
                          {canOpen ? (
                            <button type="button" className="notifications-view-btn" onClick={() => handleOpenNotification(notification)}>
                              {t('notifications_view_button')}
                            </button>
                          ) : (
                            <span className="notifications-view-empty">-</span>
                          )}
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
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Notificacoes;