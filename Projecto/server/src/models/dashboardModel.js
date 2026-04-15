const clone = (value) => JSON.parse(JSON.stringify(value));

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
        value: '4',
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

  getConsultorDashboardData() {
    return clone(dashboardData.consultor);
  },
};
