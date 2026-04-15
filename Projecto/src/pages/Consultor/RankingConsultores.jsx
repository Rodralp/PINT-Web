import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  SlidersHorizontal,
  Medal,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/Consultor/Ranking_C.css';

const consultants = [
  { id: 1, name: 'Joao Gomes', email: 'joaogomes1234@softinsa.pt', points: 2450, badges: 12, serviceLine: 'Cloud', avatar: 'https://i.pravatar.cc/120?u=joao.gomes' },
  { id: 2, name: 'Maria Santos', email: 'maria.santos@softinsa.pt', points: 2200, badges: 10, serviceLine: 'Data & AI', avatar: 'https://i.pravatar.cc/120?u=maria.santos' },
  { id: 3, name: 'Pedro Mendes', email: 'pedro.mendes@softinsa.pt', points: 1950, badges: 9, serviceLine: 'Cloud', avatar: 'https://i.pravatar.cc/120?u=pedro.mendes' },
  { id: 4, name: 'Ana Costa', email: 'ana.costa@softinsa.pt', points: 1700, badges: 8, serviceLine: 'LowCode', avatar: 'https://i.pravatar.cc/120?u=ana.costa' },
  { id: 5, name: 'Carlos Ferreira', email: 'carlos.ferreira@softinsa.pt', points: 1500, badges: 7, serviceLine: 'Cybersecurity', avatar: 'https://i.pravatar.cc/120?u=carlos.ferreira' },
  { id: 6, name: 'Rita Oliveira', email: 'rita.oliveira@softinsa.pt', points: 1450, badges: 7, serviceLine: 'Data & AI', avatar: 'https://i.pravatar.cc/120?u=rita.oliveira' },
  { id: 7, name: 'Bruno Alves', email: 'bruno.alves@softinsa.pt', points: 1350, badges: 7, serviceLine: 'Cloud', avatar: 'https://i.pravatar.cc/120?u=bruno.alves' },
  { id: 8, name: 'Sofia Rodrigues', email: 'sofia.rodrigues@softinsa.pt', points: 1250, badges: 7, serviceLine: 'LowCode', avatar: 'https://i.pravatar.cc/120?u=sofia.rodrigues' },
  { id: 9, name: 'Giorgian Arrascarta', email: 'giorgian.arrascarta@softinsa.pt', points: 1250, badges: 6, serviceLine: 'Cybersecurity', avatar: 'https://i.pravatar.cc/120?u=giorgian.arrascarta' },
  { id: 10, name: 'Ana Clara', email: 'ana.clara@softinsa.pt', points: 1200, badges: 6, serviceLine: 'Data & AI', avatar: 'https://i.pravatar.cc/120?u=ana.clara' },
  { id: 11, name: 'Omar Rocha', email: 'omar.rocha@softinsa.pt', points: 1200, badges: 5, serviceLine: 'Cloud', avatar: 'https://i.pravatar.cc/120?u=omar.rocha' },
  { id: 12, name: 'Raquel Ribeiro', email: 'raquel.ribeiro@softinsa.pt', points: 1200, badges: 5, serviceLine: 'LowCode', avatar: 'https://i.pravatar.cc/120?u=raquel.ribeiro' },
];

const ITEMS_PER_PAGE = 12;

function RankingConsultores() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeServiceLine, setActiveServiceLine] = useState('all');
  const [sortBy, setSortBy] = useState('points_desc');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(1);

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const serviceLineOptions = useMemo(() => ['all', ...new Set(consultants.map((item) => item.serviceLine))], []);

  const sortOptions = useMemo(() => [
    { id: 'points_desc', label: 'Pontos (Maior para Menor)' },
    { id: 'points_asc', label: 'Pontos (Menor para Maior)' },
    { id: 'badges_desc', label: 'Badges (Maior para Menor)' },
    { id: 'name_asc', label: 'Nome (A-Z)' },
  ], []);

  const filteredConsultants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return consultants.filter((item) => {
      const serviceLineMatch = activeServiceLine === 'all' || item.serviceLine === activeServiceLine;
      const searchMatch =
        normalizedSearch.length === 0
        || item.name.toLowerCase().includes(normalizedSearch)
        || item.email.toLowerCase().includes(normalizedSearch)
        || item.serviceLine.toLowerCase().includes(normalizedSearch);

      return serviceLineMatch && searchMatch;
    });
  }, [searchTerm, activeServiceLine]);

  const sortedConsultants = useMemo(() => {
    return [...filteredConsultants].sort((a, b) => {
      if (sortBy === 'points_asc') {
        return a.points - b.points || a.name.localeCompare(b.name);
      }

      if (sortBy === 'badges_desc') {
        return b.badges - a.badges || b.points - a.points;
      }

      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }

      return b.points - a.points || b.badges - a.badges;
    });
  }, [filteredConsultants, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedConsultants.length / ITEMS_PER_PAGE));

  const pagedConsultants = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedConsultants.slice(start, end).map((item, index) => ({
      ...item,
      rank: start + index + 1,
    }));
  }, [sortedConsultants, page]);

  const activeFilterLabel = activeServiceLine === 'all' ? 'Todas as Service Lines' : activeServiceLine;
  const activeSortLabel = sortOptions.find((item) => item.id === sortBy)?.label || sortOptions[0].label;

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

  const onSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const onFilterSelect = (serviceLine) => {
    setActiveServiceLine(serviceLine);
    setShowFilterDropdown(false);
    setPage(1);
  };

  const onSortSelect = (selectedSort) => {
    setSortBy(selectedSort);
    setShowSortDropdown(false);
    setPage(1);
  };

  const previousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const nextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  return (
    <Layout>
      <div className="ranking-page">
        <header className="ranking-header">
          <button type="button" className="ranking-back-btn" onClick={handleGoBack} aria-label="Voltar">
            <ArrowLeft size={22} />
          </button>
          <h1>Ranking de Consultores</h1>
        </header>

        <section className="ranking-shell">
          <div className="ranking-controls">
            <div className="ranking-search-wrap">
              <Search size={20} />
              <input
                type="text"
                placeholder="Pesquisar badges"
                aria-label="Pesquisar badges"
                value={searchTerm}
                onChange={onSearchChange}
              />
            </div>

            <div className="ranking-dropdown" ref={filterDropdownRef}>
              <button
                type="button"
                className={`ranking-action-btn ${showFilterDropdown || activeServiceLine !== 'all' ? 'active' : ''}`}
                onClick={() => {
                  setShowFilterDropdown((current) => !current);
                  setShowSortDropdown(false);
                }}
              >
                <Filter size={20} />
                <span>Filtrar pesquisa</span>
              </button>

              {showFilterDropdown && (
                <div className="ranking-dropdown-menu" role="menu" aria-label="Filtrar por service line">
                  {serviceLineOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`ranking-dropdown-item ${activeServiceLine === option ? 'active' : ''}`}
                      onClick={() => onFilterSelect(option)}
                    >
                      {option === 'all' ? 'Todas as Service Lines' : option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ranking-dropdown" ref={sortDropdownRef}>
              <button
                type="button"
                className={`ranking-action-btn ${showSortDropdown || sortBy !== 'points_desc' ? 'active' : ''}`}
                onClick={() => {
                  setShowSortDropdown((current) => !current);
                  setShowFilterDropdown(false);
                }}
              >
                <SlidersHorizontal size={20} />
                <span>Ordenar</span>
              </button>

              {showSortDropdown && (
                <div className="ranking-dropdown-menu" role="menu" aria-label="Ordenar ranking">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`ranking-dropdown-item ${sortBy === option.id ? 'active' : ''}`}
                      onClick={() => onSortSelect(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ranking-current-state">{activeFilterLabel} · {activeSortLabel}</div>

          <div className="ranking-grid">
            {pagedConsultants.map((consultant) => {
              const isTopThree = consultant.rank <= 3;

              return (
                <article key={consultant.id} className="ranking-card">
                  <div className={`ranking-badge ${isTopThree ? `top-${consultant.rank}` : ''}`}>
                    {isTopThree ? <Medal size={18} strokeWidth={2} /> : <span>#{consultant.rank}</span>}
                  </div>

                  <img className="ranking-avatar" src={consultant.avatar} alt={consultant.name} />

                  <div className="ranking-content">
                    <strong>{consultant.name}</strong>
                    <span>{consultant.email}</span>

                    <div className="ranking-metrics">
                      <div>
                        <small>Pontos</small>
                        <p>{consultant.points}</p>
                      </div>
                      <div>
                        <small>Badges</small>
                        <p>
                          <Award size={13} />
                          {consultant.badges}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {sortedConsultants.length === 0 && (
            <div className="ranking-empty-state">Nao ha consultores para os filtros escolhidos.</div>
          )}

          <div className="ranking-pagination" role="navigation" aria-label="Paginacao de ranking">
            <button type="button" className="ranking-page-btn ghost" onClick={previousPage} disabled={page === 1}>
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`ranking-page-btn ${pageNumber === page ? 'active' : ''}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button type="button" className="ranking-page-btn ghost" onClick={nextPage} disabled={page === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default RankingConsultores;