const levelBadgeImageMap = {
  'Júnior': '/badges/Júnior.png',
  'Intermédio': '/badges/Intermédio.png',
  'Sénior': '/badges/Sénior.png',
  'Especialista': '/badges/Especialista.png',
  'Líder de Conhecimento': '/badges/Líder de Conhecimento.png',
};

export const defaultMyRequests = [
  { id: 1, badge: 'UX/UI Design', level: 'Especialista', date: '05/12/2025', status: 'pendente' },
  { id: 2, badge: 'Data Analytics', level: 'Intermédio', date: '04/12/2025', status: 'rejeitado' },
  { id: 3, badge: 'Cloud Architecture', level: 'Sénior', date: '03/12/2025', status: 'aprovado' },
  { id: 4, badge: 'LowCode (Outsystems)', level: 'Júnior', date: '01/12/2025', status: 'pendente' },
  { id: 5, badge: 'DevOps', level: 'Intermédio', date: '30/11/2025', status: 'pendente' },
  { id: 6, badge: 'Cybersecurity', level: 'Líder de Conhecimento', date: '28/11/2025', status: 'aprovado' },
  { id: 7, badge: 'Machine Learning', level: 'Sénior', date: '25/11/2025', status: 'aprovado' },
  { id: 8, badge: 'Mobile Development', level: 'Júnior', date: '22/11/2025', status: 'rejeitado' },
  { id: 9, badge: 'Blockchain', level: 'Especialista', date: '20/11/2025', status: 'aprovado' },
  { id: 10, badge: 'IoT Solutions', level: 'Intermédio', date: '18/11/2025', status: 'pendente' },
];

const detailsById = {
  1: {
    levelLabel: 'Nível Especialista',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    expiresAt: '12 Jan 2026',
    points: 250,
    submittedBy: 'Jó Soares',
    submissionDate: '05 de dezembro de 2025',
    reviewerName: null,
    reviewerDate: null,
    reviewerNote: 'Candidatura submetida e a aguardar validação do Talent Manager.',
    requirements: [
      {
        id: 'e1',
        title: 'E1 - Implementar conectividade híbrida',
        files: 2,
        description: 'Texto de exemplo que resume o requisito selecionado do subnível, do nível, da service line, do learning path.',
      },
      {
        id: 'e2',
        title: 'E2 - Monitorizar infraestrutura híbrida',
        files: 1,
        description: 'Evidência sobre monitorização contínua dos serviços críticos com alertas e plano de resposta.',
      },
      {
        id: 'e3',
        title: 'E3 - Implementar disaster recovery',
        files: 2,
        description: 'Descrição das evidências de recuperação, redundância e continuidade operacional.',
      },
    ],
  },
  2: {
    levelLabel: 'Nível Intermédio',
    area: 'Jornada Técnica',
    path: 'Data & Insights',
    expiresAt: '09 Jan 2026',
    points: 150,
    submittedBy: 'Jó Soares',
    submissionDate: '04 de dezembro de 2025',
    reviewerName: 'João Soares',
    reviewerDate: '23 de dezembro de 2025',
    reviewerNote: 'Evidências insuficientes para a conclusão da submissão.',
    requirements: [
      {
        id: 'd1',
        title: 'D1 - Preparar dataset para análise',
        files: 1,
        description: 'Evidência de preparação e validação de dados para o caso de uso submetido.',
      },
      {
        id: 'd2',
        title: 'D2 - Construir dashboard de indicadores',
        files: 1,
        description: 'Implementação de dashboard e métricas de impacto de negócio.',
      },
      {
        id: 'd3',
        title: 'D3 - Apresentar conclusões técnicas',
        files: 2,
        description: 'Relatório técnico com conclusões e próximos passos da solução.',
      },
    ],
  },
  3: {
    levelLabel: 'Nível Sénior',
    area: 'Jornada Técnica',
    path: 'Cloud & Infrastructure',
    expiresAt: '15 Jan 2026',
    points: 200,
    submittedBy: 'Jó Soares',
    submissionDate: '03 de dezembro de 2025',
    reviewerName: 'Raquel Ribeiro',
    reviewerDate: '13 de dezembro de 2025',
    reviewerNote: 'Candidatura aprovada com base nas evidências submetidas.',
    requirements: [
      {
        id: 'c1',
        title: 'C1 - Configurar arquitetura cloud escalável',
        files: 2,
        description: 'Desenho da arquitetura e aplicação de boas práticas de escalabilidade.',
      },
      {
        id: 'c2',
        title: 'C2 - Definir observabilidade de workloads',
        files: 1,
        description: 'Monitorização, logs e rastreabilidade dos principais serviços.',
      },
      {
        id: 'c3',
        title: 'C3 - Testar estratégia de recuperação',
        files: 2,
        description: 'Execução de testes de recuperação e validação dos tempos de resposta.',
      },
    ],
  },
  4: {
    levelLabel: 'Nível Júnior',
    area: 'Jornada Técnica',
    path: 'Application Operations',
    expiresAt: '10 Jan 2026',
    points: 100,
    submittedBy: 'Jó Soares',
    submissionDate: '01 de dezembro de 2025',
    reviewerName: null,
    reviewerDate: null,
    reviewerNote: 'Candidatura submetida e a aguardar validação do Talent Manager.',
    requirements: [
      {
        id: 'a1',
        title: 'A1 - Implementar conectividade híbrida',
        files: 2,
        description: 'Evidência de configuração e validação de conectividade entre ambientes.',
      },
      {
        id: 'a2',
        title: 'A2 - Monitorizar infraestrutura híbrida',
        files: 1,
        description: 'Indicadores de monitorização, alertas e disponibilidade dos serviços.',
      },
      {
        id: 'a3',
        title: 'A3 - Implementar disaster recovery',
        files: 2,
        description: 'Plano e testes de recuperação para os componentes críticos.',
      },
    ],
  },
  5: {
    levelLabel: 'Nível Intermédio',
    area: 'Jornada Técnica',
    path: 'Platform Engineering',
    expiresAt: '11 Jan 2026',
    points: 150,
    submittedBy: 'Jó Soares',
    submissionDate: '30 de novembro de 2025',
    reviewerName: null,
    reviewerDate: null,
    reviewerNote: 'Candidatura submetida e a aguardar validação do Talent Manager.',
    requirements: [
      {
        id: 'p1',
        title: 'P1 - Automatizar pipeline de integração',
        files: 2,
        description: 'Configuração de pipeline CI com validações de qualidade e segurança.',
      },
      {
        id: 'p2',
        title: 'P2 - Melhorar estratégia de deployment',
        files: 1,
        description: 'Evidência de rollout controlado e rollback automatizado.',
      },
      {
        id: 'p3',
        title: 'P3 - Integrar observabilidade operacional',
        files: 2,
        description: 'Métricas e alertas para acompanhamento de performance e incidentes.',
      },
    ],
  },
};

const buildFallbackRequirements = () => [
  {
    id: 'r1',
    title: 'R1 - Evidência técnica submetida',
    files: 1,
    description: 'Descrição resumida do requisito e das evidências partilhadas.',
  },
  {
    id: 'r2',
    title: 'R2 - Evidência funcional submetida',
    files: 1,
    description: 'Descrição resumida do requisito e das evidências partilhadas.',
  },
  {
    id: 'r3',
    title: 'R3 - Evidência de impacto submetida',
    files: 1,
    description: 'Descrição resumida do requisito e das evidências partilhadas.',
  },
];

const buildFallbackFromState = (stateRequest) => {
  if (!stateRequest) {
    return null;
  }

  const level = stateRequest.level || 'Intermédio';
  const badgeImage = levelBadgeImageMap[level] || '/badges/Intermédio.png';
  return {
    id: stateRequest.id,
    badge: stateRequest.badge || 'Badge',
    level,
    levelLabel: `Nível ${level}`,
    date: stateRequest.date || 'Data não definida',
    status: stateRequest.status || 'pendente',
    badgeImage,
    area: 'Jornada Técnica',
    path: 'Application Operations',
    expiresAt: '12 Jan 2026',
    points: 150,
    submittedBy: 'Jó Soares',
    submissionDate: stateRequest.date || 'Data não definida',
    reviewerName: null,
    reviewerDate: null,
    reviewerNote: 'Candidatura submetida e a aguardar validação do Talent Manager.',
    requirements: buildFallbackRequirements(),
  };
};

export const getConsultorRequestById = (requestId, stateRequest) => {
  const normalizedId = Number(requestId);
  const baseRequest = defaultMyRequests.find((request) => request.id === normalizedId) || null;
  const details = detailsById[normalizedId] || null;

  if (!baseRequest && !details) {
    return buildFallbackFromState(stateRequest);
  }

  const merged = {
    ...(baseRequest || {}),
    ...(details || {}),
    ...(stateRequest || {}),
  };

  const level = merged.level || 'Intermédio';
  return {
    ...merged,
    level,
    levelLabel: merged.levelLabel || `Nível ${level}`,
    badgeImage: merged.badgeImage || levelBadgeImageMap[level] || '/badges/Intermédio.png',
    requirements: Array.isArray(merged.requirements) && merged.requirements.length > 0
      ? merged.requirements
      : buildFallbackRequirements(),
    reviewerNote: merged.reviewerNote || 'Candidatura submetida e a aguardar validação do Talent Manager.',
  };
};