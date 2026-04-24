import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Megaphone,
  Search,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import '../../css/Consultor/MensagensAvisos.css';

const messageTypes = [
  { id: 'todos', labelKey: 'announcements_filter_all' },
  { id: 'mensagem', labelKey: 'announcements_filter_messages' },
  { id: 'aviso', labelKey: 'announcements_filter_notices' },
  { id: 'importante', labelKey: 'announcements_filter_important' },
];

const sortOptions = [
  { id: 'recentes', labelKey: 'announcements_sort_recent' },
  { id: 'antigas', labelKey: 'announcements_sort_oldest' },
  { id: 'prioridade', labelKey: 'announcements_sort_priority' },
];

const defaultMessages = [
  {
    id: 'msg-1',
    typeId: 'aviso',
    priority: 1,
    title: 'Aviso Importante',
    summary: 'Alteracao em curso na area de service line para badges relacionados com C++ Mastery.',
    author: 'Talent Management',
    date: '2026-04-16',
    tag: 'Importante',
    accent: '#3b82f6',
    avatar: 'https://i.pravatar.cc/120?u=talent.management',
    body: [
      'Havera, num futuro proximo, um completo overhaul da area de service line “C++ Mastery”.',
      'Recomendamos que, caso algum consultor queira candidatar-se para uma das suas badges, que espere as mudancas serem feitas.',
      'Caso o consultor possua uma candidatura em progresso, recomenda-se que a conclua o mais brevemente possivel.',
    ],
  },
  {
    id: 'msg-2',
    typeId: 'mensagem',
    priority: 2,
    title: 'Nova mensagen da equipa',
    summary: 'Publicacao de uma nova trilha de aprendizagem para LowCode.',
    author: 'Joao Gomes',
    date: '2026-04-15',
    tag: 'Mensagem',
    accent: '#9851e8',
    avatar: 'https://i.pravatar.cc/120?u=joao.gomes.messages',
    body: [
      'Foi publicada uma nova trilha de aprendizagem para LowCode (Outsystems).',
      'A trilha inclui materiais atualizados e novos requisitos para o nivel seguinte.',
    ],
  },
  {
    id: 'msg-3',
    typeId: 'aviso',
    priority: 1,
    title: 'Badge "C++ Mastery" expira em 30 dias',
    summary: 'Renovar certificacao antes do prazo para nao perder o progresso.',
    author: 'Sistema',
    date: '2026-04-14',
    tag: 'Aviso',
    accent: '#f4c20d',
    avatar: 'https://i.pravatar.cc/120?u=system.badge.expiry',
    body: [
      'O badge “C++ Mastery” aproxima-se do prazo de expiracao.',
      'Sugerimos revisar as evidencias e renovar a candidatura com antecedencia.',
    ],
  },
  {
    id: 'msg-4',
    typeId: 'mensagem',
    priority: 3,
    title: 'Atualizacao do ranking mensal',
    summary: 'A lista de consultores foi atualizada com os resultados do mes.',
    author: 'Ranking Team',
    date: '2026-04-13',
    tag: 'Mensagem',
    accent: '#4cd07d',
    avatar: 'https://i.pravatar.cc/120?u=ranking.team',
    body: [
      'O ranking mensal foi atualizado com os novos resultados de badges e pontos.',
      'Consulta a tua posicao e valida as badges em progresso para melhorares o teu registo.',
    ],
  },
  {
    id: 'msg-5',
    typeId: 'importante',
    priority: 1,
    title: 'Atenção a candidaturas em progresso',
    summary: 'Conclui processos pendentes antes de submeter novos pedidos.',
    author: 'Administração',
    date: '2026-04-12',
    tag: 'Importante',
    accent: '#ef4444',
    avatar: 'https://i.pravatar.cc/120?u=admin.notice',
    body: [
      'Se tiveres candidaturas em progresso, conclui-as antes de iniciar novas submissões.',
      'Isso evita conflitos de estado e facilita a validação da tua evolução.',
    ],
  },
  {
    id: 'msg-6',
    typeId: 'aviso',
    priority: 2,
    title: 'Manutencao programada esta sexta-feira',
    summary: 'Pode haver indisponibilidade temporaria durante a janela de manutencao.',
    author: 'IT Operations',
    date: '2026-04-11',
    tag: 'Aviso',
    accent: '#1f8fe5',
    avatar: 'https://i.pravatar.cc/120?u=it.operations',
    body: [
      'Havera manutencao programada na plataforma durante a janela habitual de operacoes.',
      'Durante esse periodo, algumas acoes podem ficar temporariamente indisponiveis.',
    ],
  },
  {
    id: 'msg-7',
    typeId: 'mensagem',
    priority: 3,
    title: 'Reconhecimento da equipa',
    summary: 'Agradecimento pelo trabalho realizado nas ultimas semanas.',
    author: 'Direcao',
    date: '2026-04-10',
    tag: 'Mensagem',
    accent: '#8b5cf6',
    avatar: 'https://i.pravatar.cc/120?u=direction.team',
    body: [
      'A direcao agradece o trabalho realizado nas ultimas semanas e o empenho em manter os objetivos alinhados.',
      'Continuem a acompanhar os novos avisos e a atualizar o vosso progresso nas badges.',
    ],
  },
  {
    id: 'msg-8',
    typeId: 'aviso',
    priority: 2,
    title: 'Nova ronda de badges disponivel',
    summary: 'Foram carregadas novas badges para consulta e candidatura.',
    author: 'Platform Team',
    date: '2026-04-09',
    tag: 'Aviso',
    accent: '#22c55e',
    avatar: 'https://i.pravatar.cc/120?u=platform.team',
    body: [
      'Foram carregadas novas badges para consulta no catalogo e para exportacao.',
      'Explora os novos niveis e verifica os requisitos antes de iniciar candidatura.',
    ],
  },
  {
    id: 'msg-9',
    typeId: 'mensagem',
    priority: 3,
    title: 'Feedback sobre aprendizagem',
    summary: 'Sugestoes da equipa para melhorar o ritmo de estudos.',
    author: 'Learning Team',
    date: '2026-04-08',
    tag: 'Mensagem',
    accent: '#f97316',
    avatar: 'https://i.pravatar.cc/120?u=learning.team',
    body: [
      'A equipa de aprendizagem partilhou recomendações para reduzir o tempo entre candidaturas.',
      'Vale a pena rever os requisitos e consolidar o progresso antes de avançar para o nivel seguinte.',
    ],
  },
  {
    id: 'msg-10',
    typeId: 'aviso',
    priority: 1,
    title: 'Atualizacao de politicas internas',
    summary: 'O processo de notificação foi ajustado para melhor clareza.',
    author: 'Compliance',
    date: '2026-04-07',
    tag: 'Importante',
    accent: '#0ea5e9',
    avatar: 'https://i.pravatar.cc/120?u=compliance.notice',
    body: [
      'As politicas internas de comunicacao foram atualizadas para melhorar a clareza das notificacoes.',
      'Revê os avisos antes de submeter candidaturas ou concluir processos pendentes.',
    ],
  },
  {
    id: 'msg-11',
    typeId: 'mensagem',
    priority: 2,
    title: 'Resumo da semana',
    summary: 'Resumo rapido das mensagens e avisos mais relevantes.',
    author: 'Sistema',
    date: '2026-04-06',
    tag: 'Mensagem',
    accent: '#14b8a6',
    avatar: 'https://i.pravatar.cc/120?u=system.summary',
    body: [
      'Esta semana destacam-se as alteracoes do service line e as manutencoes agendadas.',
      'Mantem-te atento aos avisos importantes para nao perderes prazos ou atualizacoes.',
    ],
  },
  {
    id: 'msg-12',
    typeId: 'aviso',
    priority: 2,
    title: 'Novo aviso de expiração',
    summary: 'Algumas badges passaram a ter data de expiracao visivel.',
    author: 'Product Team',
    date: '2026-04-05',
    tag: 'Aviso',
    accent: '#a855f7',
    avatar: 'https://i.pravatar.cc/120?u=product.team',
    body: [
      'As badges agora apresentam a data de expiracao de forma mais clara no detalhe.',
      'Essa informacao ajuda a planear renovacoes e candidaturas futuras.',
    ],
  },
  {
    id: 'msg-13',
    typeId: 'mensagem',
    priority: 3,
    title: 'Mensagem da comunidade',
    summary: 'Partilha de experiencias entre consultores.',
    author: 'Comunidade',
    date: '2026-04-04',
    tag: 'Mensagem',
    accent: '#f59e0b',
    avatar: 'https://i.pravatar.cc/120?u=community.team',
    body: [
      'A comunidade de consultores partilhou estrategias para acelerar o progresso em badges mais complexas.',
      'Consulta as mensagens anteriores para recolheres dicas uteis.',
    ],
  },
  {
    id: 'msg-14',
    typeId: 'aviso',
    priority: 1,
    title: 'Avaliacoes internas abertas',
    summary: 'As avaliacoes do periodo atual estao disponiveis para consulta.',
    author: 'RH',
    date: '2026-04-03',
    tag: 'Importante',
    accent: '#db2777',
    avatar: 'https://i.pravatar.cc/120?u=hr.team',
    body: [
      'As avaliacoes internas do periodo atual ja estao disponiveis para consulta na plataforma.',
      'Analisa as observacoes e confirma os teus dados antes de seguir para a proxima fase.',
    ],
  },
  {
    id: 'msg-15',
    typeId: 'mensagem',
    priority: 3,
    title: 'Mensagem final da semana',
    summary: 'Encerramento da semana com os principais destaques.',
    author: 'Gestao',
    date: '2026-04-02',
    tag: 'Mensagem',
    accent: '#6366f1',
    avatar: 'https://i.pravatar.cc/120?u=management.team',
    body: [
      'Boa semana a todos. Os novos avisos ja estao disponiveis e o catalogo foi atualizado.',
      'Mantem os teus dados e o progresso das badges em dia para uma experiencia mais fluida.',
    ],
  },
];

const ITEMS_PER_PAGE = 6;

const formatDate = (value, locale = 'pt-PT') => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

function MensagensAvisos() {
  const { t, i18n } = useTranslation();
  const [messages] = useState(defaultMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('recentes');
  const [page, setPage] = useState(1);
  const [selectedMessageId, setSelectedMessageId] = useState(defaultMessages[0].id);
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

  const filteredMessages = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return messages.filter((message) => {
      const typeMatch = activeFilter === 'todos' || message.typeId === activeFilter;
      const searchMatch =
        normalizedSearch.length === 0
        || message.title.toLowerCase().includes(normalizedSearch)
        || message.summary.toLowerCase().includes(normalizedSearch)
        || message.author.toLowerCase().includes(normalizedSearch)
        || message.body.some((paragraph) => paragraph.toLowerCase().includes(normalizedSearch));

      return typeMatch && searchMatch;
    });
  }, [messages, activeFilter, searchTerm]);

  const sortedMessages = useMemo(() => {
    return [...filteredMessages].sort((a, b) => {
      if (sortBy === 'antigas') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      if (sortBy === 'prioridade') {
        return a.priority - b.priority || new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredMessages, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedMessages.length / ITEMS_PER_PAGE));

  const pagedMessages = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedMessages.slice(start, end);
  }, [sortedMessages, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilter, sortBy]);

  useEffect(() => {
    if (!pagedMessages.length) {
      setSelectedMessageId(null);
      return;
    }

    if (!selectedMessageId || !pagedMessages.some((message) => message.id === selectedMessageId)) {
      setSelectedMessageId(pagedMessages[0].id);
    }
  }, [pagedMessages, selectedMessageId]);

  const filters = useMemo(() => messageTypes, []);
  const activeFilterLabel = filters.find((item) => item.id === activeFilter)
    ? t(filters.find((item) => item.id === activeFilter).labelKey)
    : t('announcements_filter_all');

  const activeSortLabel = sortOptions.find((item) => item.id === sortBy)
    ? t(sortOptions.find((item) => item.id === sortBy).labelKey)
    : t('announcements_sort_recent');

  const hasActiveFilter = activeFilter !== 'todos';
  const hasActiveSort = sortBy !== 'recentes';
  const selectedMessage = sortedMessages.find((message) => message.id === selectedMessageId) || sortedMessages[0] || messages[0];

  const onPagePrev = () => setPage((current) => Math.max(1, current - 1));
  const onPageNext = () => setPage((current) => Math.min(totalPages, current + 1));

  return (
    <Layout>
      <div className="announcements-page">
        <header className="announcements-header">
          <h1>{t('announcements_title')}</h1>
        </header>

        <section className="announcements-shell">
          <div className="announcements-toolbar">
            <label className="announcements-search-wrap" htmlFor="announcements-search-input">
              <Search size={20} />
              <input
                id="announcements-search-input"
                type="text"
                placeholder={t('announcements_search_placeholder')}
                aria-label={t('announcements_search_placeholder')}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="announcements-control-group" ref={filterDropdownRef}>
              <button
                type="button"
                className={`announcements-control-btn ${showFilterDropdown || hasActiveFilter ? 'active' : ''}`}
                onClick={() => {
                  setShowFilterDropdown((current) => !current);
                  setShowSortDropdown(false);
                }}
              >
                <Filter size={18} />
                <span className="announcements-control-btn-label">{`${t('announcements_filter_label')}: ${activeFilterLabel}`}</span>
              </button>

              {showFilterDropdown && (
                <div className="announcements-dropdown-menu" aria-label={t('announcements_filter_label')}>
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={`announcements-dropdown-item ${activeFilter === filter.id ? 'active' : ''}`}
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

            <div className="announcements-control-group" ref={sortDropdownRef}>
              <button
                type="button"
                className={`announcements-control-btn ${showSortDropdown || hasActiveSort ? 'active' : ''}`}
                onClick={() => {
                  setShowSortDropdown((current) => !current);
                  setShowFilterDropdown(false);
                }}
              >
                <SlidersHorizontal size={18} />
                <span className="announcements-control-btn-label">{`${t('announcements_sort_label')}: ${activeSortLabel}`}</span>
              </button>

              {showSortDropdown && (
                <div className="announcements-dropdown-menu" aria-label={t('announcements_sort_label')}>
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`announcements-dropdown-item ${sortBy === option.id ? 'active' : ''}`}
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

          <div className="announcements-grid">
            <aside className="announcements-list-panel">
              <div className="announcements-panel-head">
                <h2>{t('announcements_title')}</h2>
                <span>{sortedMessages.length} {t('announcements_items_label')}</span>
              </div>

              <div className="announcements-list">
                {pagedMessages.map((message) => {
                  const isSelected = message.id === selectedMessageId;

                  return (
                    <button
                      key={message.id}
                      type="button"
                      className={`announcement-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedMessageId(message.id)}
                    >
                      <img className="announcement-avatar" src={message.avatar} alt={message.author} />
                      <div className="announcement-item-content">
                        <strong>{message.title}</strong>
                        <span>{message.summary}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="announcements-pagination" role="navigation" aria-label={t('pagination')}>
                <button type="button" className="announcements-page-btn ghost" onClick={onPagePrev} disabled={page === 1} aria-label={t('previous_page')}>
                  <ChevronLeft size={16} />
                </button>

                <span className="announcements-page-count">{page} / {totalPages}</span>

                <button type="button" className="announcements-page-btn ghost" onClick={onPageNext} disabled={page === totalPages} aria-label={t('next_page')}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </aside>

            <section className="announcements-detail-panel">
              {selectedMessage ? (
                <div className="announcement-detail-card">
                  <div className="announcement-detail-header">
                    <div className="announcement-detail-tag" style={{ backgroundColor: `${selectedMessage.accent}18`, color: selectedMessage.accent }}>
                      {selectedMessage.tag}
                    </div>
                    <div className="announcement-detail-meta">
                      <span>
                        <CalendarDays size={14} />
                        {formatDate(selectedMessage.date, i18n.language === 'en' ? 'en-GB' : 'pt-PT')}
                      </span>
                      <span>
                        <UserRound size={14} />
                        {selectedMessage.author}
                      </span>
                    </div>
                  </div>

                  <h3>{selectedMessage.title}</h3>

                  <div className="announcement-detail-body">
                    {selectedMessage.body.map((paragraph, index) => (
                      <p key={`${selectedMessage.id}-${index}`}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="announcement-detail-footer">
                    <Megaphone size={16} />
                    <span>{activeFilterLabel}</span>
                  </div>
                </div>
              ) : (
                <div className="announcements-empty-state">{t('announcements_empty_state')}</div>
              )}
            </section>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default MensagensAvisos;