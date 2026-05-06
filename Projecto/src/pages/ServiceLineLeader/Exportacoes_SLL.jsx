import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileDown,
  Filter,
  Medal,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import Layout from '../../components/Layout';
import '../../css/TalentManager/Exportacoes_TM.css';

const tabs = [
  { id: 'pedidos', label: 'Pedidos de Badges' },
  { id: 'badges', label: 'Badges' },
  { id: 'consultores', label: 'Consultores' },
];

const requestStatusFilters = [
  { id: 'enviado', label: 'Enviados' },
  { id: 'pendente', label: 'Pendente' },
  { id: 'rejeitado', label: 'Rejeitado' },
];

const levelFilterOptions = [
  { id: 'todos', label: 'Todos os níveis' },
  { id: 'junior', label: 'Júnior' },
  { id: 'intermedio', label: 'Intermédio' },
  { id: 'senior', label: 'Sénior' },
  { id: 'especialista', label: 'Especialista' },
  { id: 'lider', label: 'Líder de Conhecimento' },
];

const consultantFilterOptions = [
  { id: 'todos', label: 'Todos os estados' },
  { id: 'ativo', label: 'Ativo' },
  { id: 'inativo', label: 'Inativo' },
];

const requestSortOptions = [
  { id: 'recentes', label: 'Mais recentes' },
  { id: 'antigas', label: 'Mais antigas' },
  { id: 'consultor_az', label: 'Consultor (A-Z)' },
];

const badgeSortOptions = [
  { id: 'padrao', label: 'Ordem padrão' },
  { id: 'points_desc', label: 'Pontos (Maior para Menor)' },
  { id: 'points_asc', label: 'Pontos (Menor para Maior)' },
  { id: 'area_asc', label: 'Área (A-Z)' },
];

const consultantSortOptions = [
  { id: 'points_desc', label: 'Pontos (Maior para Menor)' },
  { id: 'points_asc', label: 'Pontos (Menor para Maior)' },
  { id: 'nome_az', label: 'Nome (A-Z)' },
  { id: 'entrada_recente', label: 'Data de entrada (Recente)' },
];

const tabDefaults = {
  pedidos: { filter: 'todos', sort: 'recentes' },
  badges: { filter: 'todos', sort: 'padrao' },
  consultores: { filter: 'todos', sort: 'points_desc' },
};

const knownServiceLines = ['LowCode', 'Cloud', 'Data & AI', 'Cybersecurity'];

const serviceLineByEmail = {
  'pedro.mendes@softinsa.pt': 'Cloud',
  'maria.santos@softinsa.pt': 'Data & AI',
  'ana.costa@softinsa.pt': 'LowCode',
  'joaogomes1234@softinsa.pt': 'LowCode',
};

const requestSeedRows = [
  { id: 1, detailId: 1, consultant: 'Ana Costa', badge: 'UX/UI Design', level: 'Especialista', date: '05/12/2025', status: 'pendente', serviceLine: 'LowCode' },
  { id: 2, detailId: 2, consultant: 'Pedro Mendes', badge: 'Data Analytics', level: 'Intermédio', date: '04/12/2025', status: 'rejeitado', serviceLine: 'Cloud' },
  { id: 3, detailId: 3, consultant: 'Maria Santos', badge: 'Cloud Architecture', level: 'Sénior', date: '03/12/2025', status: 'enviado', serviceLine: 'Data & AI' },
  { id: 4, detailId: 4, consultant: 'João Silva', badge: 'LowCode (Outsystems)', level: 'Líder de Conhecimento', date: '01/12/2025', status: 'pendente', serviceLine: 'LowCode' },
  { id: 5, detailId: 5, consultant: 'Rita Oliveira', badge: 'DevOps', level: 'Intermédio', date: '30/11/2025', status: 'pendente', serviceLine: 'Data & AI' },
  { id: 6, detailId: 6, consultant: 'Carlos Ferreira', badge: 'Cybersecurity', level: 'Líder de Conhecimento', date: '28/11/2025', status: 'enviado', serviceLine: 'Cybersecurity' },
  { id: 7, detailId: 7, consultant: 'Bruno Alves', badge: 'Machine Learning', level: 'Sénior', date: '25/11/2025', status: 'enviado', serviceLine: 'Cloud' },
  { id: 8, detailId: 8, consultant: 'Sofia Rodrigues', badge: 'Mobile Development', level: 'Júnior', date: '22/11/2025', status: 'rejeitado', serviceLine: 'LowCode' },
  { id: 9, detailId: 9, consultant: 'Tiago Martins', badge: 'Blockchain', level: 'Especialista', date: '20/11/2025', status: 'enviado', serviceLine: 'Cybersecurity' },
  { id: 10, detailId: 10, consultant: 'Inês Carvalho', badge: 'IoT Solutions', level: 'Intermédio', date: '18/11/2025', status: 'pendente', serviceLine: 'Data & AI' },
];

const consultantSeedRows = [
  { id: 1, rankSeed: 1, name: 'João Gomes', email: 'joaogomes1234@softinsa.pt', points: 2450, joinedAt: '15/01/2023', badges: 12, status: 'ativo', serviceLine: 'LowCode' },
  { id: 2, rankSeed: 2, name: 'Maria Santos', email: 'maria.santos@softinsa.pt', points: 2200, joinedAt: '20/02/2023', badges: 10, status: 'ativo', serviceLine: 'Data & AI' },
  { id: 3, rankSeed: 3, name: 'Pedro Mendes', email: 'pedro.mendes@softinsa.pt', points: 1950, joinedAt: '10/03/2023', badges: 9, status: 'ativo', serviceLine: 'Cloud' },
  { id: 4, rankSeed: 4, name: 'Ana Costa', email: 'ana.costa@softinsa.pt', points: 1700, joinedAt: '05/04/2023', badges: 8, status: 'inativo', serviceLine: 'LowCode' },
  { id: 5, rankSeed: 5, name: 'Carlos Ferreira', email: 'carlos.ferreira@softinsa.pt', points: 1500, joinedAt: '12/05/2023', badges: 7, status: 'ativo', serviceLine: 'Cybersecurity' },
  { id: 6, rankSeed: 6, name: 'Rita Oliveira', email: 'rita.oliveira@softinsa.pt', points: 1450, joinedAt: '18/06/2023', badges: 7, status: 'ativo', serviceLine: 'Data & AI' },
  { id: 7, rankSeed: 7, name: 'Bruno Alves', email: 'bruno.alves@softinsa.pt', points: 1350, joinedAt: '22/07/2023', badges: 6, status: 'ativo', serviceLine: 'Cloud' },
  { id: 8, rankSeed: 8, name: 'Sofia Rodrigues', email: 'sofia.rodrigues@softinsa.pt', points: 1280, joinedAt: '14/08/2023', badges: 6, status: 'inativo', serviceLine: 'LowCode' },
  { id: 9, rankSeed: 9, name: 'Tiago Martins', email: 'tiago.martins@softinsa.pt', points: 1150, joinedAt: '05/09/2023', badges: 5, status: 'ativo', serviceLine: 'Cybersecurity' },
  { id: 10, rankSeed: 10, name: 'Inês Carvalho', email: 'ines.carvalho@softinsa.pt', points: 1100, joinedAt: '11/10/2023', badges: 5, status: 'ativo', serviceLine: 'Data & AI' },
];

const badgeLevels = [
  { id: 'junior', label: 'Júnior', points: 100, badgeImage: '/badges/Júnior.png' },
  { id: 'intermedio', label: 'Intermédio', points: 150, badgeImage: '/badges/Intermédio.png' },
  { id: 'senior', label: 'Sénior', points: 200, badgeImage: '/badges/Sénior.png' },
  { id: 'especialista', label: 'Especialista', points: 250, badgeImage: '/badges/Especialista.png' },
  { id: 'lider', label: 'Líder de Conhecimento', points: 300, badgeImage: '/badges/Líder de Conhecimento.png' },
];

const badgeFamilies = [
  { area: 'LowCode (Outsystems)', serviceLine: 'LowCode' },
  { area: 'Cloud Architecture', serviceLine: 'Cloud' },
  { area: 'Data Analytics', serviceLine: 'Data & AI' },
  { area: 'UX/UI Design', serviceLine: 'LowCode' },
  { area: 'DevOps', serviceLine: 'Cloud' },
  { area: 'Cybersecurity', serviceLine: 'Cybersecurity' },
];

const requestStatusMeta = {
  enviado: { label: 'Enviados', className: 'sent' },
  pendente: { label: 'Pendente', className: 'pending' },
  rejeitado: { label: 'Rejeitado', className: 'rejected' },
};

const parsePtDate = (value) => {
  const [day, month, year] = String(value).split('/').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const formatPtDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const shiftPtDate = (value, monthsToSubtract) => {
  const baseDate = parsePtDate(value);
  baseDate.setMonth(baseDate.getMonth() - monthsToSubtract);
  return formatPtDate(baseDate);
};

const normalizeLevelId = (level) => {
  const normalized = String(level || '').trim().toLowerCase();

  if (normalized.includes('júnior') || normalized.includes('junior')) {
    return 'junior';
  }

  if (normalized.includes('intermédio') || normalized.includes('intermedio')) {
    return 'intermedio';
  }

  if (normalized.includes('sénior') || normalized.includes('senior')) {
    return 'senior';
  }

  if (normalized.includes('especialista')) {
    return 'especialista';
  }

  if (normalized.includes('líder') || normalized.includes('lider')) {
    return 'lider';
  }

  return 'junior';
};

const buildRequestRows = () =>
  Array.from({ length: 3 }, (_, cycle) =>
    requestSeedRows.map((item) => ({
      ...item,
      id: item.id + cycle * 100,
      date: shiftPtDate(item.date, cycle * 2),
    })),
  ).flat();

const buildConsultantRows = () =>
  Array.from({ length: 3 }, (_, cycle) =>
    consultantSeedRows.map((item) => ({
      ...item,
      id: item.id + cycle * 100,
      points: Math.max(850, item.points - cycle * 170),
      badges: Math.max(3, item.badges - cycle),
      joinedAt: shiftPtDate(item.joinedAt, cycle * 4),
    })),
  ).flat();

const buildBadgeItems = () => {
  let nextId = 1;

  return badgeFamilies.flatMap((family, areaOrder) =>
    badgeLevels.map((level, levelOrder) => ({
      id: `badge-${nextId++}`,
      area: family.area,
      areaOrder,
      serviceLine: family.serviceLine,
      levelId: level.id,
      level: level.label,
      levelOrder,
      points: level.points,
      badgeImage: level.badgeImage,
      date: '12 Jan 2026',
    })),
  );
};

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

const normalizeServiceLine = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const resolveUserServiceLine = (loginData) => {
  const candidates = [
    loginData?.serviceLine,
    loginData?.service_line,
    loginData?.serviceLineName,
    loginData?.service_line_name,
    loginData?.area,
    loginData?.departamento,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeServiceLine(candidate);
    const matched = knownServiceLines.find((line) => normalizeServiceLine(line) === normalizedCandidate);

    if (matched) {
      return matched;
    }
  }

  const email = String(loginData?.email || '').trim().toLowerCase();

  if (serviceLineByEmail[email]) {
    return serviceLineByEmail[email];
  }

  return 'LowCode';
};

const getLoginName = (loginData) => loginData?.nome || '';

function ExportacoesSLL() {
  const navigate = useNavigate();
  const requestItems = useMemo(() => buildRequestRows(), []);
  const consultantItems = useMemo(() => buildConsultantRows(), []);
  const badgeItems = useMemo(() => buildBadgeItems(), []);
  const loginData = useMemo(() => getStoredLoginData(), []);
  const currentServiceLine = useMemo(() => resolveUserServiceLine(loginData), [loginData]);
  const scopedRequestItems = useMemo(
    () => requestItems.filter((item) => item.serviceLine === currentServiceLine),
    [requestItems, currentServiceLine],
  );
  const scopedConsultantItems = useMemo(
    () => consultantItems.filter((item) => item.serviceLine === currentServiceLine),
    [consultantItems, currentServiceLine],
  );
  const scopedBadgeItems = useMemo(
    () => badgeItems.filter((item) => item.serviceLine === currentServiceLine),
    [badgeItems, currentServiceLine],
  );

  const [activeTab, setActiveTab] = useState('pedidos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(tabDefaults.pedidos.filter);
  const [sortBy, setSortBy] = useState(tabDefaults.pedidos.sort);
  const [activeRequestStatuses, setActiveRequestStatuses] = useState(requestStatusFilters.map((item) => item.id));
  const [selectedRequestIds, setSelectedRequestIds] = useState(() => scopedRequestItems.slice(0, 7).map((item) => item.id));
  const [selectedBadgeIds, setSelectedBadgeIds] = useState(() => scopedBadgeItems.slice(0, 13).map((item) => item.id));
  const [selectedConsultantIds, setSelectedConsultantIds] = useState(() => scopedConsultantItems.slice(0, 4).map((item) => item.id));
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(1);

  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const filterOptions = useMemo(
    () => (activeTab === 'consultores' ? consultantFilterOptions : levelFilterOptions),
    [activeTab],
  );

  const sortOptions = useMemo(() => {
    if (activeTab === 'pedidos') {
      return requestSortOptions;
    }

    if (activeTab === 'consultores') {
      return consultantSortOptions;
    }

    return badgeSortOptions;
  }, [activeTab]);

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

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return scopedRequestItems.filter((item) => {
      const levelId = normalizeLevelId(item.level);
      const matchesSearch =
        normalizedSearch.length === 0
        || item.consultant.toLowerCase().includes(normalizedSearch)
        || item.badge.toLowerCase().includes(normalizedSearch)
        || item.level.toLowerCase().includes(normalizedSearch);
      const matchesLevel = activeFilter === 'todos' || levelId === activeFilter;
      const matchesStatus = activeRequestStatuses.includes(item.status);

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [scopedRequestItems, searchTerm, activeFilter, activeRequestStatuses]);

  const sortedRequests = useMemo(() => {
    const nextRows = [...filteredRequests];

    if (sortBy === 'antigas') {
      nextRows.sort((a, b) => parsePtDate(a.date) - parsePtDate(b.date));
      return nextRows;
    }

    if (sortBy === 'consultor_az') {
      nextRows.sort((a, b) => a.consultant.localeCompare(b.consultant));
      return nextRows;
    }

    nextRows.sort((a, b) => parsePtDate(b.date) - parsePtDate(a.date));
    return nextRows;
  }, [filteredRequests, sortBy]);

  const filteredBadges = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return scopedBadgeItems.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0
        || item.area.toLowerCase().includes(normalizedSearch)
        || item.level.toLowerCase().includes(normalizedSearch);
      const matchesLevel = activeFilter === 'todos' || item.levelId === activeFilter;

      return matchesSearch && matchesLevel;
    });
  }, [scopedBadgeItems, searchTerm, activeFilter]);

  const sortedBadges = useMemo(() => {
    const nextRows = [...filteredBadges];

    if (sortBy === 'points_desc') {
      nextRows.sort((a, b) => b.points - a.points || a.areaOrder - b.areaOrder);
      return nextRows;
    }

    if (sortBy === 'points_asc') {
      nextRows.sort((a, b) => a.points - b.points || a.areaOrder - b.areaOrder);
      return nextRows;
    }

    if (sortBy === 'area_asc') {
      nextRows.sort((a, b) => a.area.localeCompare(b.area) || a.points - b.points);
      return nextRows;
    }

    nextRows.sort((a, b) => a.areaOrder - b.areaOrder || a.levelOrder - b.levelOrder);
    return nextRows;
  }, [filteredBadges, sortBy]);

  const filteredConsultants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return scopedConsultantItems.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0
        || item.name.toLowerCase().includes(normalizedSearch)
        || item.email.toLowerCase().includes(normalizedSearch);
      const matchesStatus = activeFilter === 'todos' || item.status === activeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [scopedConsultantItems, searchTerm, activeFilter]);

  const sortedConsultants = useMemo(() => {
    const nextRows = [...filteredConsultants];

    if (sortBy === 'points_asc') {
      nextRows.sort((a, b) => a.points - b.points || a.name.localeCompare(b.name));
      return nextRows;
    }

    if (sortBy === 'nome_az') {
      nextRows.sort((a, b) => a.name.localeCompare(b.name));
      return nextRows;
    }

    if (sortBy === 'entrada_recente') {
      nextRows.sort((a, b) => parsePtDate(b.joinedAt) - parsePtDate(a.joinedAt));
      return nextRows;
    }

    nextRows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
    return nextRows;
  }, [filteredConsultants, sortBy]);

  const pageSize = 10;

  const totalItems =
    activeTab === 'pedidos'
      ? sortedRequests.length
      : activeTab === 'badges'
        ? sortedBadges.length
        : sortedConsultants.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const pagedRequests = useMemo(() => sortedRequests.slice(start, end), [sortedRequests, start, end]);
  const pagedBadges = useMemo(() => sortedBadges.slice(start, end), [sortedBadges, start, end]);

  const pagedConsultants = useMemo(
    () =>
      sortedConsultants.slice(start, end).map((item, index) => ({
        ...item,
        rank: start + index + 1,
      })),
    [sortedConsultants, start, end],
  );

  const selectedRequestCount = filteredRequests.filter((item) => selectedRequestIds.includes(item.id)).length;
  const selectedBadgeCount = filteredBadges.filter((item) => selectedBadgeIds.includes(item.id)).length;
  const selectedConsultantCount = filteredConsultants.filter((item) => selectedConsultantIds.includes(item.id)).length;

  const allFilteredRequestsSelected =
    filteredRequests.length > 0 && filteredRequests.every((item) => selectedRequestIds.includes(item.id));
  const allFilteredBadgesSelected =
    filteredBadges.length > 0 && filteredBadges.every((item) => selectedBadgeIds.includes(item.id));
  const allFilteredConsultantsSelected =
    filteredConsultants.length > 0 && filteredConsultants.every((item) => selectedConsultantIds.includes(item.id));

  const selectedCount =
    activeTab === 'pedidos'
      ? selectedRequestCount
      : activeTab === 'badges'
        ? selectedBadgeCount
        : selectedConsultantCount;

  const allSelectedCurrentTab =
    activeTab === 'pedidos'
      ? allFilteredRequestsSelected
      : activeTab === 'badges'
        ? allFilteredBadgesSelected
        : allFilteredConsultantsSelected;

  const hasActiveFilter = activeFilter !== tabDefaults[activeTab].filter;
  const hasActiveSort = sortBy !== tabDefaults[activeTab].sort;

  const searchPlaceholder = activeTab === 'consultores' ? 'Pesquisar consultores' : 'Pesquisar badges';

  const userName = getLoginName(loginData) || 'Joana Gomes';

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/service-line-leader/dashboard');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm('');
    setActiveFilter(tabDefaults[tabId].filter);
    setSortBy(tabDefaults[tabId].sort);
    setPage(1);
    setShowFilterDropdown(false);
    setShowSortDropdown(false);

    if (tabId === 'pedidos') {
      setActiveRequestStatuses(requestStatusFilters.map((item) => item.id));
    }
  };

  const toggleRequestStatusFilter = (statusId) => {
    setActiveRequestStatuses((current) => {
      if (current.includes(statusId)) {
        return current.filter((item) => item !== statusId);
      }

      return [...current, statusId];
    });

    setPage(1);
  };

  const toggleRequestSelection = (id) => {
    setSelectedRequestIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]);
  };

  const toggleBadgeSelection = (id) => {
    setSelectedBadgeIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]);
  };

  const toggleConsultantSelection = (id) => {
    setSelectedConsultantIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]);
  };

  const toggleSelectAll = () => {
    if (activeTab === 'pedidos') {
      setSelectedRequestIds((current) => {
        if (allFilteredRequestsSelected) {
          return current.filter((id) => !filteredRequests.some((item) => item.id === id));
        }

        const next = new Set(current);
        filteredRequests.forEach((item) => next.add(item.id));
        return Array.from(next);
      });
      return;
    }

    if (activeTab === 'badges') {
      setSelectedBadgeIds((current) => {
        if (allFilteredBadgesSelected) {
          return current.filter((id) => !filteredBadges.some((item) => item.id === id));
        }

        const next = new Set(current);
        filteredBadges.forEach((item) => next.add(item.id));
        return Array.from(next);
      });
      return;
    }

    setSelectedConsultantIds((current) => {
      if (allFilteredConsultantsSelected) {
        return current.filter((id) => !filteredConsultants.some((item) => item.id === id));
      }

      const next = new Set(current);
      filteredConsultants.forEach((item) => next.add(item.id));
      return Array.from(next);
    });
  };

  const previousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const nextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  return (
    <Layout>
      <div className="tm-export-page">
        <header className="tm-export-header">
          <button type="button" className="tm-export-back-btn" onClick={handleGoBack} aria-label="Voltar">
            <ArrowLeft size={22} />
          </button>
          <h1>Exportações Service Line</h1>
        </header>

        <section className="tm-export-shell">
          <div className="tm-export-tabs" role="tablist" aria-label="Separadores de exportação">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`tm-export-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tm-export-toolbar">
            <label className="tm-export-search" htmlFor="tm-export-search-input">
              <Search size={20} />
              <input
                id="tm-export-search-input"
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
              />
            </label>

            <div className="tm-export-control-group" ref={filterDropdownRef}>
              <button
                type="button"
                className={`tm-export-control-btn ${showFilterDropdown || hasActiveFilter ? 'active' : ''}`}
                onClick={() => {
                  setShowFilterDropdown((current) => !current);
                  setShowSortDropdown(false);
                }}
              >
                <Filter size={18} />
                <span>Filtrar pesquisa</span>
              </button>

              {showFilterDropdown && (
                <div className="tm-export-dropdown-menu" role="menu" aria-label="Filtrar pesquisa">
                  {filterOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`tm-export-dropdown-item ${activeFilter === item.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveFilter(item.id);
                        setShowFilterDropdown(false);
                        setPage(1);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="tm-export-control-group" ref={sortDropdownRef}>
              <button
                type="button"
                className={`tm-export-control-btn ${showSortDropdown || hasActiveSort ? 'active' : ''}`}
                onClick={() => {
                  setShowSortDropdown((current) => !current);
                  setShowFilterDropdown(false);
                }}
              >
                <SlidersHorizontal size={18} />
                <span>Ordenar</span>
              </button>

              {showSortDropdown && (
                <div className="tm-export-dropdown-menu" role="menu" aria-label="Ordenar">
                  {sortOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`tm-export-dropdown-item ${sortBy === item.id ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(item.id);
                        setShowSortDropdown(false);
                        setPage(1);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="tm-export-scope-note">
            Exportação limitada à Service Line: <strong>{currentServiceLine}</strong>
          </p>

          {activeTab === 'pedidos' && (
            <>
              <div className="tm-export-section-head">
                <h2>Pedidos de Badges</h2>
                <div className="tm-export-section-actions">
                  <button type="button" className="tm-export-link-btn" onClick={toggleSelectAll}>
                    {allSelectedCurrentTab ? 'Desselecionar todos' : 'Selecionar todos'}
                  </button>
                  <span className="tm-export-selected-count">{selectedCount} selecionados</span>
                  <button type="button" className="tm-export-btn secondary" aria-label="Exportar pedidos em PDF">
                    <FileDown size={16} />
                    <span>Exportar PDF</span>
                  </button>
                  <button type="button" className="tm-export-btn primary" aria-label="Exportar pedidos em Excel">
                    <ArrowDownToLine size={16} />
                    <span>Exportar Excel</span>
                  </button>
                </div>
              </div>

              <div className="tm-export-status-row">
                <span>Filtrar por:</span>
                {requestStatusFilters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`tm-export-status-chip ${activeRequestStatuses.includes(item.id) ? 'active' : ''} ${item.id}`}
                    onClick={() => toggleRequestStatusFilter(item.id)}
                    aria-pressed={activeRequestStatuses.includes(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="tm-export-table-wrap">
                <table className="tm-export-table">
                  <thead>
                    <tr>
                      <th />
                      <th>Nome do Consultor</th>
                      <th>Badge Pedida</th>
                      <th>Nível</th>
                      <th>Data do Pedido ↓</th>
                      <th>Estado do Pedido</th>
                      <th>Detalhes do Pedido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRequests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="tm-export-empty-row">Sem resultados para os filtros escolhidos.</td>
                      </tr>
                    )}

                    {pagedRequests.map((item) => {
                      const status = requestStatusMeta[item.status] || requestStatusMeta.pendente;

                      return (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="checkbox"
                              className="tm-export-checkbox"
                              checked={selectedRequestIds.includes(item.id)}
                              onChange={() => toggleRequestSelection(item.id)}
                              aria-label={`Selecionar pedido de ${item.consultant}`}
                            />
                          </td>
                          <td>{item.consultant}</td>
                          <td>{item.badge}</td>
                          <td>{item.level}</td>
                          <td>{item.date}</td>
                          <td>
                            <span className={`tm-export-request-pill ${status.className}`}>{status.label}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="tm-export-view-btn"
                              onClick={() => navigate(`/talent-manager/pedidos/${item.detailId}`)}
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
            </>
          )}

          {activeTab === 'badges' && (
            <>
              <div className="tm-export-section-head">
                <h2>Badges</h2>
                <div className="tm-export-section-actions">
                  <button type="button" className="tm-export-link-btn" onClick={toggleSelectAll}>
                    {allSelectedCurrentTab ? 'Desselecionar todos' : 'Selecionar todos'}
                  </button>
                  <span className="tm-export-selected-count">{selectedCount} selecionados</span>
                  <button type="button" className="tm-export-btn secondary" aria-label="Exportar badges em PDF">
                    <FileDown size={16} />
                    <span>Exportar PDF</span>
                  </button>
                  <button type="button" className="tm-export-btn primary" aria-label="Exportar badges em Excel">
                    <ArrowDownToLine size={16} />
                    <span>Exportar Excel</span>
                  </button>
                </div>
              </div>

              <div className="tm-export-badges-grid">
                {pagedBadges.map((item) => {
                  const isSelected = selectedBadgeIds.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`tm-export-badge-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleBadgeSelection(item.id)}
                    >
                      <div className="tm-export-badge-frame">
                        <img src={item.badgeImage} alt={item.level} className="tm-export-badge-image" />
                      </div>
                      <strong>{item.area}</strong>
                      <span>{item.level}</span>
                      <div className="tm-export-badge-meta">
                        <div>
                          <Trophy size={14} />
                          {item.points} pontos
                        </div>
                        <div>
                          <Clock3 size={14} />
                          {item.date}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}


          {activeTab === 'consultores' && (
            <>
              <div className="tm-export-section-head">
                <h2>Consultores</h2>
                <div className="tm-export-section-actions">
                  <button type="button" className="tm-export-link-btn" onClick={toggleSelectAll}>
                    {allSelectedCurrentTab ? 'Desselecionar todos' : 'Selecionar todos'}
                  </button>
                  <span className="tm-export-selected-count">{selectedCount} selecionados</span>
                  <button type="button" className="tm-export-btn secondary" aria-label="Exportar consultores em PDF">
                    <FileDown size={16} />
                    <span>Exportar PDF</span>
                  </button>
                  <button type="button" className="tm-export-btn primary" aria-label="Exportar consultores em Excel">
                    <ArrowDownToLine size={16} />
                    <span>Exportar Excel</span>
                  </button>
                </div>
              </div>

              <div className="tm-export-table-wrap">
                <table className="tm-export-table consultores">
                  <thead>
                    <tr>
                      <th />
                      <th>Ranking</th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Pontos</th>
                      <th>Data de Entrada</th>
                      <th>Badges</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedConsultants.length === 0 && (
                      <tr>
                        <td colSpan={8} className="tm-export-empty-row">Sem resultados para os filtros escolhidos.</td>
                      </tr>
                    )}

                    {pagedConsultants.map((item) => {
                      const isTopThree = item.rank <= 3;

                      return (
                        <tr key={item.id}>
                          <td>
                            <input
                              type="checkbox"
                              className="tm-export-checkbox"
                              checked={selectedConsultantIds.includes(item.id)}
                              onChange={() => toggleConsultantSelection(item.id)}
                              aria-label={`Selecionar ${item.name}`}
                            />
                          </td>
                          <td>
                            <span className={`tm-export-rank ${isTopThree ? `top-${item.rank}` : 'default'}`}>
                              {isTopThree ? <Medal size={14} /> : `#${item.rank}`}
                            </span>
                          </td>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>
                            <span className="tm-export-points">
                              <TrendingUp size={13} />
                              {new Intl.NumberFormat('pt-PT').format(item.points)}
                            </span>
                          </td>
                          <td>{item.joinedAt}</td>
                          <td>
                            <span className="tm-export-badge-count">{item.badges}</span>
                          </td>
                          <td>
                            <span className={`tm-export-consultor-status ${item.status}`}>
                              {item.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="tm-export-pagination" role="navigation" aria-label="Paginação de exportações">
            <button type="button" className="tm-export-page-btn ghost" onClick={previousPage} disabled={page === 1}>
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`tm-export-page-btn ${pageNumber === page ? 'active' : ''}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button type="button" className="tm-export-page-btn ghost" onClick={nextPage} disabled={page === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default ExportacoesSLL;