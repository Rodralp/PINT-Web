import { QueryTypes } from 'sequelize';
import { consultorModel } from './consultorModel.js';
import { sequelize } from '../config/database.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

const buildDailySeries = (rows, totalDays = 12) => {
  const countsByDate = new Map();

  for (const row of rows || []) {
    const dateKey = String(row.activity_date || '').slice(0, 10);
    if (!dateKey) {
      continue;
    }

    const currentValue = countsByDate.get(dateKey) || 0;
    countsByDate.set(dateKey, currentValue + Number(row.activity_count) || 0);
  }

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (totalDays - 1 - index));
    const dateKey = date.toISOString().slice(0, 10);
    return countsByDate.get(dateKey) || 0;
  });
};

const normalizeRequestState = (value) => String(value || '').trim().toLowerCase();

const mapRequestStateToIconKey = (state) => {
  const normalized = normalizeRequestState(state);

  if (normalized === 'aprovado') return 'searchCheck';
  if (normalized === 'em_validacao' || normalized === 'em_validacao_sll') return 'clock';
  if (normalized === 'evidencias_insuficientes') return 'alertTriangle';
  return 'alertTriangle';
};

const mapRequestStateToSubtitle = (state) => {
  const normalized = normalizeRequestState(state);

  if (normalized === 'aprovado') return 'Aprovado';
  if (normalized === 'em_validacao' || normalized === 'em_validacao_sll') return 'Em validação';
  if (normalized === 'evidencias_insuficientes') return 'Evidências insuficientes';
  if (normalized === 'candidatura_em_progresso') return 'Candidatura em progresso';
  return 'Pendente';
};

const topConsultores = [
  {
    id: 1,
    name: 'Joao Gomes',
    email: 'joaogomes1234@softinsa.pt',
    iconKey: 'trophy',
    points: 2450,
    badges: 17,
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@softinsa.pt',
    iconKey: 'award',
    points: 2200,
    badges: 14,
  },
  {
    id: 3,
    name: 'Pedro Mendes',
    email: 'pedro.mendes@softinsa.pt',
    iconKey: 'users',
    points: 1950,
    badges: 9,
  },
  {
    id: 4,
    name: 'Joao Gomes',
    email: 'joaogomes1234@softinsa.pt',
    iconKey: 'trophy',
    points: 1900,
    badges: 11,
  },
];

const dashboardData = {
  'talent-manager': {
    badgesTimelineValues: [3, 4, 3, 6, 4, 8, 6, 7, 5, 8, 8, 10],
    novosConsultoresValues: [2, 5, 4, 6, 3, 7, 5, 8, 4, 6],
    onlineUsers: 1302,
    pendingRequests: 25,
    topConsultores,
    recentActivities: [
      {
        id: 1,
        title: 'Gerado relatorio de badges da area Hybrid Cloud',
        timeframe: 'Ontem',
        iconKey: 'fileText',
      },
      {
        id: 2,
        title: 'Aprovado pedido de badge',
        timeframe: 'Ha 2 horas',
        iconKey: 'checkCircle',
      },
      {
        id: 3,
        title: 'Consultado ranking de consultores da Service Line',
        timeframe: 'Ha 2 dias',
        iconKey: 'trophy',
      },
      {
        id: 4,
        title: 'Revisado progresso de 8 consultores da Service Line',
        timeframe: 'Ontem',
        iconKey: 'users',
      },
    ],
  },
  'service-line-leader': {
    badgesTimelineValues: [3, 4, 3, 6, 4, 8, 6, 7, 5, 8, 8, 10],
    novosConsultoresValues: [2, 5, 4, 6, 3, 7, 5, 8, 4, 6],
    onlineUsers: 1302,
    pendingRequests: 25,
    topConsultores,
    recentActivities: [
      {
        id: 1,
        title: 'Visualizado progresso de 5 consultores',
        timeframe: 'Ha 1 hora',
        iconKey: 'fileText',
      },
      {
        id: 2,
        title: 'Aprovado pedido de badge',
        timeframe: 'Ha 3 horas',
        iconKey: 'checkCircle',
      },
      {
        id: 3,
        title: 'Gerado relatorio de badges da area Hybrid Cloud',
        timeframe: 'Ontem',
        iconKey: 'trophy',
      },
      {
        id: 4,
        title: 'Consultado ranking de consultores da Service Line',
        timeframe: 'Ha 2 dias',
        iconKey: 'users',
      },
    ],
  },
  'admin-gestor': {
    badgesTimelineValues: [3, 4, 3, 6, 4, 8, 6, 7, 5, 8, 8, 10],
    novosConsultoresValues: [2, 5, 4, 6, 3, 7, 5, 8, 4, 6],
    onlineUsers: 1302,
    pendingRequests: 25,
    topConsultores,
    recentActivities: [
      {
        id: 1,
        title: 'Criado 3 novos utilizadores',
        timeframe: 'Ha 1 hora',
        iconKey: 'users',
      },
      {
        id: 2,
        title: 'Criada badge LowCode (Outsystem) Nivel Senior',
        timeframe: 'Ha 3 horas',
        iconKey: 'trophy',
      },
      {
        id: 3,
        title: 'Exportacao de relatorio para Excel realizada',
        timeframe: 'Ontem',
        iconKey: 'fileText',
      },
      {
        id: 4,
        title: 'Atualizada configuracao de notificacoes RGPD',
        timeframe: 'Ha 2 dias',
        iconKey: 'settings',
      },
    ],
  },
  consultor: {
    timelineValues: [3, 2, 5, 4, 6, 3, 7, 5, 8, 4, 6, 9],
    stats: [
      {
        titleKey: 'dashboard_stat_badges_title',
        value: '12',
        noteKey: 'dashboard_stat_badges_note',
        iconKey: 'award',
        tone: 'gold',
      },
      {
        titleKey: 'dashboard_stat_streak_title',
        value: '0',
        noteKey: 'dashboard_stat_streak_note',
        iconKey: 'flame',
        tone: 'fire',
      },
      {
        titleKey: 'dashboard_stat_requests_title',
        value: '5',
        noteKey: 'dashboard_stat_requests_note',
        iconKey: 'clock',
        tone: 'blue',
      },
      {
        titleKey: 'dashboard_stat_ranking_title',
        value: '#15',
        noteKey: 'dashboard_stat_ranking_note',
        iconKey: 'crown',
        tone: 'rank',
      },
    ],
    inProgressItems: [
      {
        title: 'LowCode (Outsystems)',
        subtitleKey: 'badge_level_specialist',
        accent: 'warning',
        iconKey: 'alertTriangle',
      },
      {
        title: 'LowCode (Outsystems)',
        subtitleKey: 'badge_level_senior',
        accent: 'yellow',
        iconKey: 'searchCheck',
      },
      {
        title: 'LowCode (Outsystems)',
        subtitleKey: 'badge_level_intermediate',
        accent: 'info',
        iconKey: 'clock',
      },
    ],
    suggestionItems: [
      {
        title: 'LowCode (Outsystems)',
        subtitleKey: 'badge_level_knowledge_lead',
        accent: 'success',
      },
      {
        title: 'Cloud Architecture',
        subtitleKey: 'badge_level_specialist',
        accent: 'violet',
      },
      {
        title: 'C++ Mastery',
        subtitleKey: 'badge_level_senior',
        accent: 'amber',
      },
    ],
  },
};

export const dashboardModel = {
  getTalentManagerDashboardData() {
    return clone(dashboardData['talent-manager']);
  },

  getServiceLineLeaderDashboardData() {
    return clone(dashboardData['service-line-leader']);
  },

  getAdminGestorDashboardData() {
    return clone(dashboardData['admin-gestor']);
  },

  async getConsultorDashboardData(accountId) {
    const parsedAccountId = Number(accountId);
    if (!Number.isInteger(parsedAccountId) || parsedAccountId <= 0) {
      return clone(dashboardData.consultor);
    }

    const profileData = await consultorModel.getProfileData(parsedAccountId);

    const timelineRows = await sequelize.query(
      `
        SELECT
          DATE(p.data_submissao) AS activity_date,
          COUNT(DISTINCT p.npedido) AS activity_count
        FROM pedidos AS p
        LEFT JOIN estado AS e
          ON e.nestado = p.estado
        WHERE p.nutilizador = :accountId
          AND LOWER(COALESCE(e.estado, '')) = 'aprovado'
        GROUP BY DATE(p.data_submissao)
        ORDER BY activity_date ASC
      `,
      {
        replacements: { accountId: parsedAccountId },
        type: QueryTypes.SELECT,
      },
    );

    const inProgressRows = await sequelize.query(
      `
        SELECT
          p.npedido,
          b.b_nome,
          p.data_submissao,
          COALESCE(e.estado, 'pendente') AS estado
        FROM pedidos AS p
        INNER JOIN badge AS b
          ON b.nbadge = p.nbadge
        LEFT JOIN estado AS e
          ON e.nestado = p.estado
        WHERE p.nutilizador = :accountId
          AND LOWER(COALESCE(e.estado, '')) <> 'aprovado'
        ORDER BY p.data_submissao DESC, p.npedido DESC
        LIMIT 3
      `,
      {
        replacements: { accountId: parsedAccountId },
        type: QueryTypes.SELECT,
      },
    );

    const timelineValues = buildDailySeries(timelineRows, 12);

    const inProgressItems = (inProgressRows || []).map((row) => {
      const estado = normalizeRequestState(row.estado);
      return {
        title: row.b_nome || 'Badge',
        subtitle: mapRequestStateToSubtitle(estado),
        accent: estado === 'aprovado' ? 'success' : estado === 'evidencias_insuficientes' ? 'amber' : 'warning',
        iconKey: mapRequestStateToIconKey(estado),
      };
    });

    return {
      timelineValues,
      stats: profileData.stats,
      inProgressItems: inProgressItems.length > 0 ? inProgressItems : clone(dashboardData.consultor.inProgressItems),
      suggestionItems: clone(dashboardData.consultor.suggestionItems),
      recentActivities: Array.isArray(profileData.activityItems)
        ? profileData.activityItems.slice(0, 4).map((item, index) => ({
          id: item.id || index + 1,
          title: item.description,
          timeframe: item.date,
          iconKey: item.icon === 'award' ? 'award' : 'fileText',
        }))
        : clone(dashboardData.consultor.recentActivities || []),
    };
  },
};
