import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock3, Filter, Search, SlidersHorizontal, Trophy, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { fetchCatalogBadges } from '../services/consultorService';
import '../css/Consultor/CatalogoBadges_C.css';

const badgeLevels = [
  { levelKey: 'badge_level_junior', points: 100, badgeImage: '/badges/J%C3%BAnior.png' },
  { levelKey: 'badge_level_intermediate', points: 150, badgeImage: '/badges/Interm%C3%A9dio.png' },
  { levelKey: 'badge_level_senior', points: 200, badgeImage: '/badges/S%C3%A9nior.png' },
  { levelKey: 'badge_level_specialist', points: 250, badgeImage: '/badges/Especialista.png' },
  { levelKey: 'badge_level_knowledge_lead', points: 300, badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png' },
];

const badgeAreas = ['LowCode (Outsystems)', 'Cloud Architecture'];

const SPECIAL_BADGE_TYPE = 'special';

const badgeTypes = [
  { id: 'todos', label: 'Todos' },
  { id: 'badge_level_junior', label: 'Júnior' },
  { id: 'badge_level_intermediate', label: 'Intermédio' },
  { id: 'badge_level_senior', label: 'Sénior' },
  { id: 'badge_level_specialist', label: 'Especialista' },
  { id: 'badge_level_knowledge_lead', label: 'Líder de Conhecimento' },
  { id: SPECIAL_BADGE_TYPE, label: 'Especial' },
];

const ITEMS_PER_PAGE = 10;

const normalizeBadgeItem = (item) => {
  const typeId = item.typeId || item.levelKey || (item.isSpecial ? SPECIAL_BADGE_TYPE : null);
  const isSpecial = typeId === SPECIAL_BADGE_TYPE || item.isSpecial || !item.levelKey;

  return {
    ...item,
    typeId,
    isSpecial,
  };
};

const buildDefaultBadgeItems = () =>
  badgeAreas.flatMap((area, areaIndex) =>
    badgeLevels.map((level) => ({
      id: `${area}-${level.levelKey}`,
      area,
      levelKey: level.levelKey,
      points: level.points,
      badgeImage: level.badgeImage,
      date: '12 Jan 2026',
      typeId: level.levelKey,
    })),
  );

function CatalogoBadges() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isAdminRoute = location.pathname.includes('/admin-gestor') || location.pathname.includes('/dashboard/admin');
  const catalogPath = isAdminRoute ? '/admin-gestor/catalogo-badges' : '/consultor/catalogo-badges';
  const [badgeItems, setBadgeItems] = useState(buildDefaultBadgeItems);
  const [statusMessage, setStatusMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('points_desc');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      try {
        const data = await fetchCatalogBadges();
        if (!isMounted) {
          return;
        }

        const nextItems = Array.isArray(data) && data.length > 0
          ? data.map(normalizeBadgeItem)
          : buildDefaultBadgeItems().map(normalizeBadgeItem);

        if (nextItems.length > 0) {
          setBadgeItems(nextItems);
          setStatusMessage('');
        }
      } catch {
        if (isMounted) {
          setStatusMessage('');
        }
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, [isAdminRoute, location.state?.refreshCatalog]);

  const handleOpenBadgeDetails = (item) => {
    const badgeDbId = Number(item?.badgeDbId);
    const routeBadgeId = Number.isInteger(badgeDbId) && badgeDbId > 0
      ? String(badgeDbId)
      : String(item.id);

    if (isAdminRoute) {
      navigate(`/admin-gestor/badge/${encodeURIComponent(routeBadgeId)}`, {
        state: {
          badge: item,
          backTo: catalogPath,
          activeSidebarRoute: catalogPath,
        },
      });
      return;
    }

    navigate(`/consultor/badge/${encodeURIComponent(routeBadgeId)}`, {
      state: {
        badge: item,
        backTo: catalogPath,
        activeSidebarRoute: catalogPath,
      },
    });
  };

  const handleCreateBadge = () => {
    navigate('/admin-gestor/badge/novo', {
      state: {
        backTo: catalogPath,
        activeSidebarRoute: catalogPath,
      },
    });
  };

  const handleCardKeyDown = (event, item) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenBadgeDetails(item);
    }
  };

  const filters = useMemo(() => badgeTypes, []);

  const sortOptions = useMemo(() => [
    { id: 'points_desc', label: 'Pontos (Maior para Menor)' },
    { id: 'points_asc', label: 'Pontos (Menor para Maior)' },
    { id: 'area_asc', label: 'Area (A-Z)' },
    { id: 'area_desc', label: 'Area (Z-A)' },
  ], []);

  const sortButtonLabels = useMemo(() => ({
    points_desc: 'Pontos ↓',
    points_asc: 'Pontos ↑',
    area_asc: 'Area A-Z',
    area_desc: 'Area Z-A',
  }), []);

  const activeFilterLabel = useMemo(() => {
    const selected = filters.find((filter) => filter.id === activeFilter);
    return selected ? selected.label : 'Todos';
  }, [activeFilter, filters]);

  const activeSortLabel = sortButtonLabels[sortBy] || 'Pontos ↓';
  const hasActiveFilter = activeFilter !== 'todos';
  const hasActiveSort = sortBy !== 'points_desc';

  const filteredBadges = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return badgeItems.filter((item) => {
      const badgeTitle = String(item.area || item.name || item.title || '').toLowerCase();
      const levelLabel = item.isSpecial ? 'Especial' : t(item.levelKey || '');
      const translatedLevel = levelLabel.toLowerCase();
      const searchMatch =
        normalizedSearch.length === 0
        || badgeTitle.includes(normalizedSearch)
        || translatedLevel.includes(normalizedSearch);
      const filterMatch = activeFilter === 'todos' || item.typeId === activeFilter;

      return searchMatch && filterMatch;
    });
  }, [badgeItems, activeFilter, searchTerm, t]);

  const sortedBadges = useMemo(() => {
    return [...filteredBadges].sort((a, b) => {
      if (sortBy === 'area_asc') {
        return a.area.localeCompare(b.area);
      }

      if (sortBy === 'area_desc') {
        return b.area.localeCompare(a.area);
      }

      if (sortBy === 'points_asc') {
        return a.points - b.points;
      }

      return b.points - a.points;
    });
  }, [filteredBadges, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedBadges.length / ITEMS_PER_PAGE));
  const [page, setPage] = useState(1);

  const pagedBadges = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedBadges.slice(start, end);
  }, [sortedBadges, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilter, sortBy]);

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

  const onSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const onFilterSelect = (filterId) => {
    setActiveFilter(filterId);
    setShowFilterDropdown(false);
  };

  const onSortSelect = (sortId) => {
    setSortBy(sortId);
    setShowSortDropdown(false);
  };

  const previousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const nextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  return (
    <Layout>
      <div className="catalog-page">
        <header className="catalog-header">
          <h1>{t('catalog_title')}</h1>
          {isAdminRoute && (
            <div className="catalog-header-actions">
              <button type="button" className="catalog-create-btn" onClick={handleCreateBadge}>
                <Plus size={18} />
                Criar badge
              </button>
            </div>
          )}
        </header>

        <section className="catalog-shell">
          {statusMessage && (
            <div className="alert alert-warning py-2" role="status">
              {statusMessage}
            </div>
          )}

          <div className="catalog-controls">
            <div className="catalog-search-wrap">
              <Search size={20} />
              <input
                type="text"
                placeholder={t('search_badges')}
                aria-label={t('search_badges')}
                value={searchTerm}
                onChange={onSearchChange}
              />
            </div>

            <div className="catalog-dropdown" ref={filterDropdownRef}>
              <button
                type="button"
                className={`catalog-action-btn ${showFilterDropdown || hasActiveFilter ? 'active' : ''}`}
                onClick={() => setShowFilterDropdown((current) => !current)}
              >
                <Filter size={20} />
                <span className="catalog-action-btn-label">{`${t('filter_search')}: ${activeFilterLabel}`}</span>
              </button>

              {showFilterDropdown && (
                <div className="catalog-dropdown-menu" role="menu" aria-label="Filtros de badges">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={`catalog-dropdown-item ${activeFilter === filter.id ? 'active' : ''}`}
                      onClick={() => onFilterSelect(filter.id)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="catalog-dropdown" ref={sortDropdownRef}>
              <button
                type="button"
                className={`catalog-action-btn ${showSortDropdown || hasActiveSort ? 'active' : ''}`}
                onClick={() => setShowSortDropdown((current) => !current)}
              >
                <SlidersHorizontal size={20} />
                <span className="catalog-action-btn-label">{`${t('sort')}: ${activeSortLabel}`}</span>
              </button>

              {showSortDropdown && (
                <div className="catalog-dropdown-menu" role="menu" aria-label="Ordenacao de badges">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`catalog-dropdown-item ${sortBy === option.id ? 'active' : ''}`}
                      onClick={() => onSortSelect(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="catalog-grid">
            {pagedBadges.map((item) => {
              const badgeTitle = item.area || item.name || item.title || 'Badge';
              const levelLabel = item.isSpecial ? 'Especial' : t(item.levelKey || '');
              const badgeDate = item.date || '--';

              return (
                <article
                  key={item.id}
                  className="catalog-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenBadgeDetails(item)}
                  onKeyDown={(event) => handleCardKeyDown(event, item)}
                >
                  <div className="catalog-badge-frame">
                    <img className="catalog-badge-image" src={item.badgeImage} alt={levelLabel} />
                  </div>

                  <div className="catalog-card-title">{badgeTitle}</div>
                  <div className="catalog-card-level">{levelLabel}</div>

                  <div className="catalog-card-meta">
                    <div className="catalog-meta-row">
                      <Trophy size={14} />
                      <span>{item.points} {t('points')}</span>
                    </div>
                    <div className="catalog-meta-row">
                      <Clock3 size={14} />
                      <span>{badgeDate}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="catalog-empty-state">Nenhum badge encontrado com os filtros escolhidos.</div>
          )}

          <div className="catalog-pagination" role="navigation" aria-label={t('pagination')}>
            <button
              type="button"
              className="catalog-page-btn ghost"
              aria-label={t('previous_page')}
              onClick={previousPage}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`catalog-page-btn ${pageNumber === page ? 'active' : ''}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              className="catalog-page-btn ghost"
              aria-label={t('next_page')}
              onClick={nextPage}
              disabled={page === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default CatalogoBadges;
