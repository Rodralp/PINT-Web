import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock3, Download, FileDown, Filter, Search, SlidersHorizontal, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import { fetchMyBadges } from '../../services/consultorService';
import '../../css/Consultor/Exportacoes_C.css';

const badgeLevels = [
  { levelKey: 'badge_level_junior', points: 100, badgeImage: '/badges/J%C3%BAnior.png' },
  { levelKey: 'badge_level_intermediate', points: 150, badgeImage: '/badges/Interm%C3%A9dio.png' },
  { levelKey: 'badge_level_senior', points: 200, badgeImage: '/badges/S%C3%A9nior.png' },
  { levelKey: 'badge_level_specialist', points: 250, badgeImage: '/badges/Especialista.png' },
  { levelKey: 'badge_level_knowledge_lead', points: 300, badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png' },
];

const badgeAreas = ['LowCode (Outsystems)', 'Cloud Architecture'];

const badgeFilters = [
  { id: 'todos', labelKey: 'exports_filter_all' },
  { id: 'badge_level_junior', labelKey: 'badge_level_junior' },
  { id: 'badge_level_intermediate', labelKey: 'badge_level_intermediate' },
  { id: 'badge_level_senior', labelKey: 'badge_level_senior' },
  { id: 'badge_level_specialist', labelKey: 'badge_level_specialist' },
  { id: 'badge_level_knowledge_lead', labelKey: 'badge_level_knowledge_lead' },
];

const pageSizes = {
  badges: 10,
  certificado: 10,
};

const defaultExportBadges = () =>
  badgeAreas.flatMap((area) =>
    badgeLevels.map((level) => ({
      id: `${area}-${level.levelKey}`,
      area,
      levelKey: level.levelKey,
      points: level.points,
      badgeImage: level.badgeImage,
      date: '12 Jan 2026',
    })),
  );

const normalizeBadge = (item) => ({
  ...item,
  typeId: item.typeId || item.levelKey || item.level || item.subtitleKey || 'badge_level_junior',
  levelKey: item.levelKey || item.typeId || item.level || item.subtitleKey || 'badge_level_junior',
  area: item.area || item.badge || item.title || 'LowCode (Outsystems)',
  points: Number(item.points) || 0,
  date: item.date || '12 Jan 2026',
});

const getLoginName = () => {
  const storedLoginData = sessionStorage.getItem('loginData') || localStorage.getItem('loginData');

  if (!storedLoginData) {
    return '';
  }

  try {
    const parsed = JSON.parse(storedLoginData);
    return parsed?.nome || '';
  } catch {
    return '';
  }
};

function Exportacoes() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('badges');
  const [badgeItems, setBadgeItems] = useState(defaultExportBadges);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('points_desc');
  const [page, setPage] = useState(1);
  const [selectedBadgeIds, setSelectedBadgeIds] = useState([]);
  const [selectedCertificateId, setSelectedCertificateId] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadBadges = async () => {
      try {
        const data = await fetchMyBadges();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setBadgeItems(data.map(normalizeBadge));
        }
      } catch {
        // Mantem os dados locais quando a API nao estiver disponivel.
      }
    };

    loadBadges();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setSelectedBadgeIds((current) => {
      const validIds = current.filter((badgeId) => badgeItems.some((item) => item.id === badgeId));

      if (validIds.length > 0) {
        return validIds;
      }

      return badgeItems.map((item) => item.id);
    });

    setSelectedCertificateId((current) => {
      if (current && badgeItems.some((item) => item.id === current)) {
        return current;
      }

      return badgeItems[0]?.id || null;
    });
  }, [badgeItems]);

  const navigateBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/consultor/dashboard');
  };

  const filters = useMemo(() => badgeFilters, []);

  const sortOptions = useMemo(() => ([
    { id: 'points_desc', label: t('exports_sort_points_desc') },
    { id: 'points_asc', label: t('exports_sort_points_asc') },
    { id: 'area_asc', label: t('exports_sort_area_asc') },
    { id: 'area_desc', label: t('exports_sort_area_desc') },
  ]), [t]);

  const filteredBadges = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return badgeItems.filter((item) => {
      const levelKey = item.levelKey || 'badge_level_junior';
      const translatedLevel = t(levelKey).toLowerCase();
      const filterMatch =
        activeFilter === 'todos'
        || item.typeId === activeFilter
        || levelKey === activeFilter;
      const searchMatch =
        normalizedSearch.length === 0
        || item.area.toLowerCase().includes(normalizedSearch)
        || translatedLevel.includes(normalizedSearch);

      return filterMatch && searchMatch;
    });
  }, [badgeItems, activeFilter, searchTerm, t]);

  const sortedBadges = useMemo(() => {
    return [...filteredBadges].sort((a, b) => {
      if (sortBy === 'points_asc') {
        return a.points - b.points;
      }

      if (sortBy === 'area_asc') {
        return a.area.localeCompare(b.area);
      }

      if (sortBy === 'area_desc') {
        return b.area.localeCompare(a.area);
      }

      return b.points - a.points;
    });
  }, [filteredBadges, sortBy]);

  const itemsPerPage = pageSizes[activeTab];
  const totalPages = Math.max(1, Math.ceil(sortedBadges.length / itemsPerPage));

  const pagedBadges = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedBadges.slice(start, end);
  }, [sortedBadges, page, itemsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm, activeFilter, sortBy]);

  useEffect(() => {
    if (selectedCertificateId && pagedBadges.some((item) => item.id === selectedCertificateId)) {
      return;
    }

    if (pagedBadges[0]) {
      setSelectedCertificateId(pagedBadges[0].id);
    }
  }, [pagedBadges, selectedCertificateId]);

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

  const selectedCount = selectedBadgeIds.filter((badgeId) => badgeItems.some((item) => item.id === badgeId)).length;
  const allVisibleSelected = filteredBadges.length > 0 && filteredBadges.every((item) => selectedBadgeIds.includes(item.id));
  const hasActiveFilter = activeFilter !== 'todos';
  const hasActiveSort = sortBy !== 'points_desc';

  const activeFilterLabel = filters.find((item) => item.id === activeFilter)
    ? t(filters.find((item) => item.id === activeFilter).labelKey)
    : t('exports_filter_all');

  const activeSortLabel = sortOptions.find((item) => item.id === sortBy)?.label || t('exports_sort_points_desc');

  const toggleBadgeSelection = (badgeId) => {
    setSelectedBadgeIds((current) => {
      if (current.includes(badgeId)) {
        return current.filter((item) => item !== badgeId);
      }

      return [...current, badgeId];
    });
  };

  const toggleSelectAll = () => {
    setSelectedBadgeIds((current) => {
      if (allVisibleSelected) {
        return current.filter((badgeId) => !filteredBadges.some((item) => item.id === badgeId));
      }

      const next = new Set(current);
      filteredBadges.forEach((item) => next.add(item.id));
      return Array.from(next);
    });
  };

  const selectedCertificate = badgeItems.find((item) => item.id === selectedCertificateId) || badgeItems[0];
  const userName = getLoginName() || t('app_user_default');

  const handleGoBack = navigateBack;

  return (
    <Layout>
      <div className="exports-page">
        <header className="exports-header">
          <button type="button" className="exports-back-btn" onClick={handleGoBack} aria-label={t('back')}>
            <ArrowLeft size={22} />
          </button>
          <h1>{t('exports_title')}</h1>
        </header>

        <section className="exports-shell">
          <div className="exports-tabs" role="tablist" aria-label={t('exports_title')}>
            <button
              type="button"
              className={`exports-tab ${activeTab === 'badges' ? 'active' : ''}`}
              onClick={() => setActiveTab('badges')}
              role="tab"
              aria-selected={activeTab === 'badges'}
            >
              {t('exports_tab_badges')}
            </button>
            <button
              type="button"
              className={`exports-tab ${activeTab === 'certificado' ? 'active' : ''}`}
              onClick={() => setActiveTab('certificado')}
              role="tab"
              aria-selected={activeTab === 'certificado'}
            >
              {t('exports_tab_certificate')}
            </button>
          </div>

          <div className="exports-toolbar">
            <label className="exports-search-wrap" htmlFor="exports-search-input">
              <Search size={20} />
              <input
                id="exports-search-input"
                type="text"
                placeholder={t('exports_search_placeholder')}
                aria-label={t('exports_search_placeholder')}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="exports-control-group" ref={filterDropdownRef}>
              <button type="button" className={`exports-control-btn ${showFilterDropdown || hasActiveFilter ? 'active' : ''}`} onClick={() => {
                setShowFilterDropdown((current) => !current);
                setShowSortDropdown(false);
              }}>
                <Filter size={18} />
                <span className="exports-control-btn-label">{`${t('exports_filter_label')}: ${activeFilterLabel}`}</span>
              </button>

              {showFilterDropdown && (
                <div className="exports-dropdown-menu" aria-label={t('exports_filter_label')}>
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={`exports-dropdown-item ${activeFilter === filter.id ? 'active' : ''}`}
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

            <div className="exports-control-group" ref={sortDropdownRef}>
              <button
                type="button"
                className={`exports-control-btn ${showSortDropdown || hasActiveSort ? 'active' : ''}`}
                onClick={() => {
                  setShowSortDropdown((current) => !current);
                  setShowFilterDropdown(false);
                }}
              >
                <SlidersHorizontal size={18} />
                <span className="exports-control-btn-label">{`${t('exports_sort_label')}: ${activeSortLabel}`}</span>
              </button>

              {showSortDropdown && (
                <div className="exports-dropdown-menu" aria-label={t('exports_sort_label')}>
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`exports-dropdown-item ${sortBy === option.id ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(option.id);
                        setShowSortDropdown(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {activeTab === 'badges' && (
            <>
              <div className="exports-section-head">
                <h2>{t('exports_badges_section_title')}</h2>
                <div className="exports-section-actions">
                  <button type="button" className="exports-link-button" onClick={toggleSelectAll}>
                    {allVisibleSelected ? t('exports_deselect_all') : t('exports_select_all')}
                  </button>
                  <span className="exports-selected-count">{t('exports_selected_count', { count: selectedCount })}</span>
                  <button type="button" className="exports-secondary-btn">
                    <FileDown size={16} />
                    <span>{t('exports_export_pdf')}</span>
                  </button>
                  <button type="button" className="exports-primary-btn">
                    <Download size={16} />
                    <span>{t('exports_export_excel')}</span>
                  </button>
                </div>
              </div>

              <div className="exports-grid">
                {pagedBadges.map((item) => {
                  const isSelected = selectedBadgeIds.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`exports-badge-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleBadgeSelection(item.id)}
                    >
                      <div className="exports-badge-frame">
                        <img className="exports-badge-image" src={item.badgeImage} alt={t(item.levelKey)} />
                      </div>
                      <div className="exports-badge-area">{item.area}</div>
                      <div className="exports-badge-level">{t(item.levelKey)}</div>
                      <div className="exports-badge-meta">
                        <div className="exports-meta-row">
                          <Trophy size={14} />
                          <span>{item.points} {t('points')}</span>
                        </div>
                        <div className="exports-meta-row">
                          <Clock3 size={14} />
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'certificado' && (
            <div className="exports-certificate-layout">
              <aside className="exports-certificate-sidebar">
                <div className="exports-section-head compact">
                  <h2>{t('exports_certificate_list_title')}</h2>
                  <div className="exports-mini-pager">{page} / {totalPages}</div>
                </div>

                <div className="exports-certificate-list">
                  {pagedBadges.map((item) => {
                    const isSelected = item.id === selectedCertificateId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`exports-certificate-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedCertificateId(item.id)}
                      >
                        <img src={item.badgeImage} alt={t(item.levelKey)} className="exports-certificate-thumb" />
                        <div className="exports-certificate-item-text">
                          <strong>{item.area}</strong>
                          <span>{t(item.levelKey)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button type="button" className="exports-primary-btn exports-full-width-btn">
                  <FileDown size={16} />
                  <span>{t('exports_export_pdf')}</span>
                </button>
              </aside>

              <div className="exports-certificate-preview-wrap">
                <div className="exports-certificate-preview">
                  <div className="exports-certificate-brand">SOFTINSA</div>
                  <h3>{t('exports_certificate_title')}</h3>
                  <img
                    src={selectedCertificate?.badgeImage || badgeItems[0]?.badgeImage}
                    alt={selectedCertificate ? t(selectedCertificate.levelKey) : t('exports_certificate_title')}
                    className="exports-certificate-badge"
                  />
                  <p className="exports-certificate-copy">{t('exports_certificate_sentence')}</p>
                  <strong className="exports-certificate-name">{userName}</strong>
                  <p className="exports-certificate-copy">{t('exports_certificate_earned')}</p>
                  <strong className="exports-certificate-area">{selectedCertificate?.area || t('exports_certificate_title')}</strong>
                  <span className="exports-certificate-level">
                    {selectedCertificate ? t(selectedCertificate.levelKey) : t('exports_certificate_title')}
                  </span>
                  <span className="exports-certificate-date">{selectedCertificate?.date || '12 Jan 2026'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="exports-pagination" role="navigation" aria-label={t('pagination')}>
            <button type="button" className="exports-page-btn ghost" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label={t('previous_page')}>
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`exports-page-btn ${pageNumber === page ? 'active' : ''}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button type="button" className="exports-page-btn ghost" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} aria-label={t('next_page')}>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Exportacoes;