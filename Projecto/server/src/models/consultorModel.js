import { QueryTypes } from 'sequelize';
import { Reminder } from './sql/Reminder.js';
import { sequelize } from '../config/database.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
const pedidoEstados = Object.freeze({
  candidaturaEmProgresso: 'candidatura_em_progresso',
  emValidacaoTm: 'em_validacao',
  emValidacaoSll: 'em_validacao_sll',
  evidenciasInsuficientes: 'evidencias_insuficientes',
  aprovado: 'aprovado',
});

const badgeLevelTemplates = [
  {
    levelKey: 'badge_level_junior',
    points: 100,
    badgeImage: '/badges/J%C3%BAnior.png',
  },
  {
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
  },
  {
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
  },
  {
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
  },
  {
    levelKey: 'badge_level_knowledge_lead',
    points: 300,
    badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png',
  },
];

const suggestionAccentPalette = ['success', 'violet', 'amber', 'warning', 'info', 'yellow'];
const defaultRequirementTemplates = [
  {
    title: 'Implementar conectividade hibrida',
    description: 'Texto de suporte do requisito associado a conectividade e integracao do servico.',
  },
  {
    title: 'Monitorizar infraestrutura hibrida',
    description: 'Texto de suporte do requisito associado a observabilidade, alertas e estabilidade operacional.',
  },
  {
    title: 'Implementar disaster recovery',
    description: 'Texto de suporte do requisito associado a resiliencia e continuidade de negocio.',
  },
];

const normalizeLevelTitle = (value) => {
  const rawTitle = String(value || '').trim();
  const withoutPathPrefix = rawTitle.includes(' - ')
    ? rawTitle.split(' - ').slice(1).join(' - ').trim()
    : rawTitle;

  return withoutPathPrefix.replace(/^nivel\s+/i, '').trim();
};

const normalizePedidoEstado = (estado) => String(estado || '').trim().toLowerCase();

const mapPedidoEstadoToLearningPathStatus = (estado) => {
  const normalized = normalizePedidoEstado(estado);

  if (normalized === pedidoEstados.candidaturaEmProgresso) {
    return 'candidatura_em_progresso';
  }

  if (normalized === pedidoEstados.emValidacaoTm || normalized === pedidoEstados.emValidacaoSll) {
    return 'em_validacao';
  }

  if (normalized === pedidoEstados.evidenciasInsuficientes) {
    return 'evidencias_insuficientes';
  }

  if (normalized === pedidoEstados.aprovado) {
    return 'obtido';
  }

  return 'visualizar';
};

const mapPedidoEstadoToMyBadgeState = (estado) => {
  const normalized = normalizePedidoEstado(estado);

  if (normalized === pedidoEstados.candidaturaEmProgresso) {
    return 'candidatura_em_progresso';
  }

  if (normalized === pedidoEstados.emValidacaoTm || normalized === pedidoEstados.emValidacaoSll) {
    return 'em_validacao';
  }

  if (normalized === pedidoEstados.evidenciasInsuficientes) {
    return 'rejeitado';
  }

  if (normalized === pedidoEstados.aprovado) {
    return 'aprovado';
  }

  return 'em_validacao';
};

const mapPedidoEstadoToMyRequestStatus = (estado) => {
  const normalized = normalizePedidoEstado(estado);

  if (normalized === pedidoEstados.aprovado) {
    return 'aprovado';
  }

  if (normalized === pedidoEstados.evidenciasInsuficientes) {
    return 'rejeitado';
  }

  return 'pendente';
};

const resolveBadgeTemplate = (levelName, fallbackIndex = 0) => {
  const normalizedLevelName = String(levelName || '').trim().toLowerCase();

  if (normalizedLevelName.includes('junior')) {
    return badgeLevelTemplates[0];
  }

  if (normalizedLevelName.includes('intermedio') || normalizedLevelName.includes('interm')) {
    return badgeLevelTemplates[1];
  }

  if (normalizedLevelName.includes('senior')) {
    return badgeLevelTemplates[2];
  }

  if (normalizedLevelName.includes('especialista')) {
    return badgeLevelTemplates[3];
  }

  if (normalizedLevelName.includes('lider')) {
    return badgeLevelTemplates[4];
  }

  return badgeLevelTemplates[fallbackIndex % badgeLevelTemplates.length];
};

const hasActiveBadgeRequest = (status) =>
  status === 'candidatura_em_progresso'
  || status === 'em_validacao'
  || status === 'obtido';

const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return '12 Jan 2026';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatShortDate = (value) => {
  if (!value) {
    return '--/--/----';
  }

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--/--/----';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const toUtcDayKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

const calculateConsecutiveDayStreak = (values) => {
  const uniqueDayKeys = [...new Set(
    (Array.isArray(values) ? values : [])
      .map(toUtcDayKey)
      .filter((value) => Number.isFinite(value)),
  )].sort((a, b) => b - a);

  if (uniqueDayKeys.length === 0) {
    return 0;
  }

  let streak = 1;
  let previousDayKey = uniqueDayKeys[0];

  for (let index = 1; index < uniqueDayKeys.length; index += 1) {
    const currentDayKey = uniqueDayKeys[index];
    const expectedPreviousDayKey = previousDayKey - (24 * 60 * 60 * 1000);

    if (currentDayKey !== expectedPreviousDayKey) {
      break;
    }

    streak += 1;
    previousDayKey = currentDayKey;
  }

  return streak;
};

const getUtilizadorIdByAccountId = async (accountId) => {
  const [utilizador] = await sequelize.query(
    `
      SELECT nutilizador
      FROM utilizador
      WHERE nutilizador = :accountId
      LIMIT 1
    `,
    {
      replacements: { accountId: Number(accountId) },
      type: QueryTypes.SELECT,
    },
  );

  return utilizador?.nutilizador ? Number(utilizador.nutilizador) : null;
};

const ensureEstadoId = async (estadoNome) => {
  const [existing] = await sequelize.query(
    `
      SELECT nestado
      FROM estado
      WHERE LOWER(estado) = LOWER(:estadoNome)
      LIMIT 1
    `,
    {
      replacements: { estadoNome },
      type: QueryTypes.SELECT,
    },
  );

  if (existing?.nestado) {
    return Number(existing.nestado);
  }

  const [inserted] = await sequelize.query(
    `
      INSERT INTO estado (estado)
      VALUES (:estadoNome)
      RETURNING nestado
    `,
    {
      replacements: { estadoNome },
      type: QueryTypes.SELECT,
    },
  );

  return Number(inserted.nestado);
};

const normalizeBadgeIds = (badgeIds) => [...new Set(
  (Array.isArray(badgeIds) ? badgeIds : [])
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0),
)];

const ensureRequirementsForBadges = async (badgeIds) => {
  const normalizedBadgeIds = normalizeBadgeIds(badgeIds);
  if (normalizedBadgeIds.length === 0) {
    return;
  }

  const existingRows = await sequelize.query(
    `
      SELECT DISTINCT nbadge
      FROM requisitos
      WHERE nbadge IN (:badgeIds)
    `,
    {
      replacements: { badgeIds: normalizedBadgeIds },
      type: QueryTypes.SELECT,
    },
  );

  const existingBadgeIds = new Set(existingRows.map((row) => Number(row.nbadge)));
  const missingBadgeIds = normalizedBadgeIds.filter((badgeId) => !existingBadgeIds.has(badgeId));

  for (const badgeId of missingBadgeIds) {
    for (const template of defaultRequirementTemplates) {
      await sequelize.query(
        `
          INSERT INTO requisitos (requisito, r_descricao, nbadge)
          VALUES (:title, :description, :badgeId)
        `,
        {
          replacements: {
            title: template.title,
            description: template.description,
            badgeId,
          },
          type: QueryTypes.INSERT,
        },
      );
    }
  }
};

const loadRequirementsByBadgeIds = async (badgeIds) => {
  const normalizedBadgeIds = normalizeBadgeIds(badgeIds);
  const requirementsByBadge = new Map();

  if (normalizedBadgeIds.length === 0) {
    return requirementsByBadge;
  }

  const rows = await sequelize.query(
    `
      SELECT nbadge, nreq, requisito, r_descricao
      FROM requisitos
      WHERE nbadge IN (:badgeIds)
      ORDER BY nbadge ASC, nreq ASC
    `,
    {
      replacements: { badgeIds: normalizedBadgeIds },
      type: QueryTypes.SELECT,
    },
  );

  for (const row of rows) {
    const badgeId = Number(row.nbadge);
    if (!requirementsByBadge.has(badgeId)) {
      requirementsByBadge.set(badgeId, []);
    }

    requirementsByBadge.get(badgeId).push({
      id: `req-${Number(row.nreq)}`,
      title: row.requisito || 'Requisito',
      description: row.r_descricao || 'Texto de suporte do requisito associado a candidatura.',
      files: 0,
      attachments: [],
    });
  }

  return requirementsByBadge;
};

const rankingConsultores = [
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

const buildRankingConsultores = async () => {
  const rows = await sequelize.query(
    `
      WITH badge_scores AS (
        SELECT
          cb.nutilizador,
          SUM(COALESCE(NULLIF(cb.pontos_obtidos, 0), NULLIF(b.pontos, 0), 0)) AS points,
          COUNT(DISTINCT cb.nbadge) AS badges
        FROM c_obtem_b AS cb
        INNER JOIN badge AS b
          ON b.nbadge = cb.nbadge
        GROUP BY cb.nutilizador
      ),
      service_line_scores AS (
        SELECT
          cb.nutilizador,
          sl.sline,
          SUM(COALESCE(NULLIF(cb.pontos_obtidos, 0), NULLIF(b.pontos, 0), 0)) AS points
        FROM c_obtem_b AS cb
        INNER JOIN badge AS b
          ON b.nbadge = cb.nbadge
        LEFT JOIN b_pertence_sl AS bps
          ON bps.nbadge = b.nbadge
        LEFT JOIN service_line AS sl
          ON sl.nsline = bps.nsline
        GROUP BY cb.nutilizador, sl.sline
      ),
      dominant_service_line AS (
        SELECT DISTINCT ON (nutilizador)
          nutilizador,
          sline
        FROM service_line_scores
        ORDER BY nutilizador, points DESC, sline ASC
      )
      SELECT
        u.nutilizador AS id,
        u.nome AS name,
        u.email,
        COALESCE(bs.points, 0) AS points,
        COALESCE(bs.badges, 0) AS badges,
        COALESCE(dsl.sline, 'Application Operations') AS "serviceLine",
        'https://i.pravatar.cc/120?u=' || COALESCE(NULLIF(REPLACE(LOWER(u.email), '@', '.'), ''), LOWER(REPLACE(u.nome, ' ', '.'))) AS avatar
      FROM utilizador AS u
      LEFT JOIN badge_scores AS bs
        ON bs.nutilizador = u.nutilizador
      LEFT JOIN dominant_service_line AS dsl
        ON dsl.nutilizador = u.nutilizador
      WHERE LOWER(u.role) = 'consultor'
      ORDER BY points DESC, badges DESC, u.nome ASC
    `,
    { type: QueryTypes.SELECT },
  );

  // For each consultor, fetch their service line stats
  const consultoresWithStats = await Promise.all(
    rows.map(async (row) => {
      const serviceLineRows = await sequelize.query(
        `
          SELECT
            COALESCE(sl.sline, 'Application Operations') AS serviceLine,
            COUNT(DISTINCT b.nbadge) AS badges,
            SUM(COALESCE(NULLIF(cb.pontos_obtidos, 0), NULLIF(b.pontos, 0), 0)) AS points
          FROM c_obtem_b AS cb
          INNER JOIN badge AS b
            ON b.nbadge = cb.nbadge
          LEFT JOIN b_pertence_sl AS bps
            ON bps.nbadge = b.nbadge
          LEFT JOIN service_line AS sl
            ON sl.nsline = bps.nsline
          WHERE cb.nutilizador = :accountId
          GROUP BY sl.sline
          ORDER BY COUNT(DISTINCT b.nbadge) DESC, SUM(COALESCE(NULLIF(cb.pontos_obtidos, 0), NULLIF(b.pontos, 0), 0)) DESC
        `,
        {
          replacements: { accountId: Number(row.id) },
          type: QueryTypes.SELECT,
        },
      );

      const serviceLineStats = (serviceLineRows || []).map((r) => ({
        serviceLine: r.serviceline || r.serviceLine || 'Application Operations',
        badges: Number(r.badges) || 0,
        points: Number(r.points) || 0,
      }));

      return {
        id: Number(row.id),
        name: row.name,
        email: row.email,
        points: Number(row.points) || 0,
        badges: Number(row.badges) || 0,
        serviceLine: row.serviceLine || 'Application Operations',
        avatar: row.avatar || `https://i.pravatar.cc/120?u=${encodeURIComponent(row.email || row.name || row.id)}`,
        serviceLineStats,
      };
    }),
  );

  return consultoresWithStats;
};

const profileData = {
  location: 'Portugal',
  joined: '2023',
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
  skillsItems: [
    { title: 'LowCode (Outsystems)', subtitleKey: 'badge_level_specialist', accent: 'warning' },
    { title: 'JavaScript', subtitleKey: 'badge_level_senior', accent: 'yellow' },
    { title: 'React', subtitleKey: 'badge_level_intermediate', accent: 'info' },
  ],
  certificationsItems: [
    { title: 'LowCode (Outsystems)', subtitleKey: 'badge_level_knowledge_lead', accent: 'success' },
    { title: 'Cloud Architecture', subtitleKey: 'badge_level_specialist', accent: 'violet' },
    { title: 'C++ Mastery', subtitleKey: 'badge_level_senior', accent: 'amber' },
  ],
  serviceLineStats: [
    { serviceLine: 'Cloud', badges: 12, points: 2450 },
    { serviceLine: 'Data & AI', badges: 10, points: 2200 },
    { serviceLine: 'LowCode', badges: 8, points: 1700 },
  ],
};

const buildProfileData = async (accountId) => {
  const parsedAccountId = Number(accountId);

  if (!Number.isInteger(parsedAccountId) || parsedAccountId <= 0) {
    return clone(profileData);
  }

  const [row] = await sequelize.query(
    `
      WITH badge_scores AS (
        SELECT
          cb.nutilizador,
          SUM(COALESCE(NULLIF(cb.pontos_obtidos, 0), NULLIF(b.pontos, 0), 0)) AS points,
          COUNT(DISTINCT cb.nbadge) AS badges
        FROM c_obtem_b AS cb
        INNER JOIN badge AS b
          ON b.nbadge = cb.nbadge
        GROUP BY cb.nutilizador
      ),
      service_line_scores AS (
        SELECT
          cb.nutilizador,
          sl.sline,
          SUM(COALESCE(NULLIF(cb.pontos_obtidos, 0), NULLIF(b.pontos, 0), 0)) AS points
        FROM c_obtem_b AS cb
        INNER JOIN badge AS b
          ON b.nbadge = cb.nbadge
        LEFT JOIN b_pertence_sl AS bps
          ON bps.nbadge = b.nbadge
        LEFT JOIN service_line AS sl
          ON sl.nsline = bps.nsline
        GROUP BY cb.nutilizador, sl.sline
      ),
      dominant_service_line AS (
        SELECT DISTINCT ON (nutilizador)
          nutilizador,
          sline
        FROM service_line_scores
        ORDER BY nutilizador, points DESC, sline ASC
      ),
      consultor_ranking AS (
        SELECT
          u.nutilizador,
          ROW_NUMBER() OVER (
            ORDER BY COALESCE(bs.points, 0) DESC, COALESCE(bs.badges, 0) DESC, u.nome ASC
          ) AS ranking_position
        FROM utilizador AS u
        LEFT JOIN badge_scores AS bs
          ON bs.nutilizador = u.nutilizador
        WHERE LOWER(u.role) = 'consultor'
      )
      SELECT
        u.nutilizador AS id,
        u.nome,
        u.email,
        COALESCE(bs.points, 0) AS points,
        COALESCE(bs.badges, 0) AS badges,
        COALESCE(dsl.sline, 'Application Operations') AS "serviceLine",
        'https://i.pravatar.cc/120?u=' || COALESCE(NULLIF(REPLACE(LOWER(u.email), '@', '.'), ''), LOWER(REPLACE(u.nome, ' ', '.'))) AS avatar,
        COALESCE(cr.ranking_position, 0) AS ranking
      FROM utilizador AS u
      LEFT JOIN badge_scores AS bs
        ON bs.nutilizador = u.nutilizador
      LEFT JOIN dominant_service_line AS dsl
        ON dsl.nutilizador = u.nutilizador
      LEFT JOIN consultor_ranking AS cr
        ON cr.nutilizador = u.nutilizador
      WHERE u.nutilizador = :accountId
      LIMIT 1
    `,
    {
      replacements: { accountId: parsedAccountId },
      type: QueryTypes.SELECT,
    },
  );

  if (!row) {
    return clone(profileData);
  }
  // compute per-service-line aggregates for this user (badges and points)
  const serviceLineRows = await sequelize.query(
    `
      SELECT
        COALESCE(sl.sline, 'Application Operations') AS serviceLine,
        COUNT(DISTINCT b.nbadge) AS badges,
        SUM(COALESCE(NULLIF(cb.pontos_obtidos, 0), NULLIF(b.pontos, 0), 0)) AS points
      FROM c_obtem_b AS cb
      INNER JOIN badge AS b
        ON b.nbadge = cb.nbadge
      LEFT JOIN b_pertence_sl AS bps
        ON bps.nbadge = b.nbadge
      LEFT JOIN service_line AS sl
        ON sl.nsline = bps.nsline
      WHERE cb.nutilizador = :accountId
      GROUP BY sl.sline
      ORDER BY COUNT(DISTINCT b.nbadge) DESC, SUM(COALESCE(NULLIF(cb.pontos_obtidos, 0), NULLIF(b.pontos, 0), 0)) DESC
    `,
    {
      replacements: { accountId: parsedAccountId },
      type: QueryTypes.SELECT,
    },
  );

  const serviceLineStats = (serviceLineRows || []).map((r) => ({
    serviceLine: r.serviceline || r.serviceLine || 'Application Operations',
    badges: Number(r.badges) || 0,
    points: Number(r.points) || 0,
  }));

  // Fetch request count for this user
  const requestCountRows = await sequelize.query(
    `
      SELECT COUNT(DISTINCT p.npedido) AS request_count
      FROM pedidos AS p
      WHERE p.nutilizador = :accountId
    `,
    {
      replacements: { accountId: parsedAccountId },
      type: QueryTypes.SELECT,
    },
  );

  const requestCount = Number(requestCountRows[0]?.request_count) || 0;

  // Fetch recent activity from pedidos and logs
  const activityRows = await sequelize.query(
    `
      SELECT
        p.npedido AS id,
        CASE 
          WHEN e.estado = 'candidatura_em_progresso' THEN 'Candidatura submetida para ' || b.b_nome
          WHEN e.estado = 'em_validacao' THEN 'Candidatura em validação: ' || b.b_nome
          WHEN e.estado = 'aprovado' THEN 'Badge conquistada: ' || b.b_nome
          WHEN e.estado = 'rejeitado' THEN 'Candidatura rejeitada: ' || b.b_nome
          WHEN e.estado = 'evidencias_insuficientes' THEN 'Evidências insuficientes: ' || b.b_nome
          ELSE 'Atividade em badge'
        END AS description,
        p.data_submissao AS activity_date,
        'badge' AS activity_type
      FROM pedidos AS p
      INNER JOIN badge AS b ON p.nbadge = b.nbadge
      LEFT JOIN estado AS e ON p.estado = e.nestado
      WHERE p.nutilizador = :accountId
      ORDER BY p.data_submissao DESC
      LIMIT 5
    `,
    {
      replacements: { accountId: parsedAccountId },
      type: QueryTypes.SELECT,
    },
  );

  const activityItems = (activityRows || []).map((row) => ({
    type: row.activity_type || 'badge',
    description: row.description || 'Nova atividade',
    date: formatDate(row.activity_date),
    icon: 'award',
    color: 'gold',
  }));

  const streakRows = await sequelize.query(
    `
      SELECT DISTINCT activity_date
      FROM (
        SELECT DATE(p.data_submissao) AS activity_date
        FROM pedidos AS p
        WHERE p.nutilizador = :accountId
        UNION
        SELECT DATE(l.data_log) AS activity_date
        FROM logs AS l
        WHERE l.nutilizador = :accountId
      ) AS activity_days
      WHERE activity_date IS NOT NULL
      ORDER BY activity_date DESC
    `,
    {
      replacements: { accountId: parsedAccountId },
      type: QueryTypes.SELECT,
    },
  );

  const streakDays = calculateConsecutiveDayStreak((streakRows || []).map((row) => row.activity_date));

  return {
    ...clone(profileData),
    points: Number(row.points) || 0,
    badges: Number(row.badges) || 0,
    ranking: Number(row.ranking) || 0,
    streakDays,
    serviceLine: row.serviceLine || 'Application Operations',
    avatar: row.avatar || `https://i.pravatar.cc/120?u=${encodeURIComponent(row.email || row.nome || row.id)}`,
    serviceLineStats,
    stats: [
      {
        titleKey: 'dashboard_stat_badges_title',
        value: String(Number(row.badges) || 0),
        noteKey: 'dashboard_stat_badges_note',
        iconKey: 'award',
        tone: 'gold',
      },
      {
        titleKey: 'dashboard_stat_streak_title',
        value: String(streakDays),
        noteKey: 'dashboard_stat_streak_note',
        iconKey: 'flame',
        tone: 'fire',
      },
      {
        titleKey: 'dashboard_stat_requests_title',
        value: String(requestCount),
        noteKey: 'dashboard_stat_requests_note',
        iconKey: 'clock',
        tone: 'blue',
      },
      {
        titleKey: 'dashboard_stat_ranking_title',
        value: `#${Number(row.ranking) || 0}`,
        noteKey: 'dashboard_stat_ranking_note',
        iconKey: 'crown',
        tone: 'rank',
      },
    ],
    skillsItems: (serviceLineStats || []).slice(0, 3).map((s) => ({
      title: s.serviceLine || s.name,
      subtitleKey: 'badge_level_specialist',
      accent: 'yellow',
    })),
    activityItems: activityItems.length > 0 ? activityItems : clone(profileData.activityItems),
    user: {
      id: Number(row.id),
      name: row.nome,
      email: row.email,
    },
  };
};

const buildLearningPaths = async (accountId) => {
  const rows = await sequelize.query(
    `
      SELECT
        lp.nlpath,
        lp.lpath,
        lp.lp_desc,
        sl.nsline,
        sl.sline,
        sl.sl_desc,
        a.narea,
        a.area,
        a.a_desc,
        n.nnivel,
        n.nivel,
        nb.nbadge
      FROM learning_path AS lp
      INNER JOIN service_line AS sl
        ON sl.nlpath = lp.nlpath
      LEFT JOIN area AS a
        ON a.nsline = sl.nsline
      LEFT JOIN nivel AS n
        ON n.narea = a.narea
      LEFT JOIN nivel_contem_b AS nb
        ON nb.nnivel = n.nnivel
      ORDER BY lp.nlpath ASC, sl.nsline ASC, a.narea ASC, n.nnivel ASC
    `,
    { type: QueryTypes.SELECT },
  );
  const badgeIds = normalizeBadgeIds(rows.map((row) => row.nbadge));
  await ensureRequirementsForBadges(badgeIds);
  const requirementsByBadge = await loadRequirementsByBadgeIds(badgeIds);

  let userBadges = [];
  let userRequests = [];

  const utilizadorId = accountId ? await getUtilizadorIdByAccountId(accountId) : null;
  if (utilizadorId) {
    const [loadedBadges, loadedRequests] = await Promise.all([
      sequelize.query(
        `
          SELECT nbadge
          FROM c_obtem_b
          WHERE nutilizador = :utilizadorId
        `,
        {
          replacements: { utilizadorId },
          type: QueryTypes.SELECT,
        },
      ),
      sequelize.query(
        `
          SELECT p.npedido, p.nbadge, e.estado
          FROM pedidos AS p
          INNER JOIN estado AS e
            ON e.nestado = p.estado
          WHERE p.nutilizador = :utilizadorId
          ORDER BY p.data_submissao DESC, p.npedido DESC
        `,
        {
          replacements: { utilizadorId },
          type: QueryTypes.SELECT,
        },
      ),
    ]);

    userBadges = loadedBadges;
    userRequests = loadedRequests;
  }

  const obtainedBadgeIds = new Set(userBadges.map((b) => Number(b.nbadge)));
  const requestMetadataByBadge = new Map();
  for (const r of userRequests) {
    const badgeId = Number(r.nbadge);
    if (!requestMetadataByBadge.has(badgeId)) {
      requestMetadataByBadge.set(badgeId, {
        status: mapPedidoEstadoToLearningPathStatus(r.estado),
        requestId: Number(r.npedido) || null,
      });
    }
  }

  const getRequestMetaForBadge = (nbadge) => {
    if (!nbadge) {
      return { status: 'visualizar', requestId: null };
    }

    if (obtainedBadgeIds.has(nbadge)) {
      return { status: 'obtido', requestId: null };
    }

    if (requestMetadataByBadge.has(Number(nbadge))) {
      return requestMetadataByBadge.get(Number(nbadge));
    }

    return { status: 'visualizar', requestId: null };
  };

  const learningPathMap = new Map();
  const serviceLineMap = new Map();
  const areaMap = new Map();

  for (const row of rows) {
    const pathId = `learning-path-${Number(row.nlpath)}`;
    const serviceLineId = `service-line-${Number(row.nsline)}`;
    const areaId = row.narea ? `area-${Number(row.narea)}` : null;

    if (!learningPathMap.has(pathId)) {
      learningPathMap.set(pathId, {
        id: pathId,
        name: row.lpath,
        description: row.lp_desc,
        serviceLines: [],
      });
    }

    const learningPath = learningPathMap.get(pathId);
    const serviceLineMapKey = `${pathId}:${serviceLineId}`;
    let serviceLine = serviceLineMap.get(serviceLineMapKey);

    if (!serviceLine) {
      serviceLine = {
        id: serviceLineId,
        name: row.sline,
        description: row.sl_desc,
        image: '/LP_BG.png',
        areas: [],
      };

      learningPath.serviceLines.push(serviceLine);
      serviceLineMap.set(serviceLineMapKey, serviceLine);
    }

    if (!areaId) {
      continue;
    }

    const areaMapKey = `${serviceLineMapKey}:${areaId}`;
    let area = areaMap.get(areaMapKey);

    if (!area) {
      area = {
        id: areaId,
        name: row.area,
        description: row.a_desc,
        levels: [],
      };

      serviceLine.areas.push(area);
      areaMap.set(areaMapKey, area);
    }

    if (row.nnivel) {
      const template = badgeLevelTemplates[area.levels.length % badgeLevelTemplates.length];
      const badgeDbId = row.nbadge ? Number(row.nbadge) : null;
      const requestMeta = getRequestMetaForBadge(badgeDbId);
      const requirements = badgeDbId
        ? clone(requirementsByBadge.get(badgeDbId) || [])
        : [];

      area.levels.push({
        id: `nivel-${Number(row.nnivel)}`,
        title: normalizeLevelTitle(row.nivel),
        subtitle: `Nivel ${area.levels.length + 1}`,
        ...template,
        badgeDbId,
        requestId: requestMeta.requestId,
        requirements,
        status: requestMeta.status,
      });
    }
  }

  return Array.from(learningPathMap.values());
};

const buildMyBadges = async (accountId) => {
  const utilizadorId = await getUtilizadorIdByAccountId(accountId);
  if (!utilizadorId) {
    return [];
  }

  const [obtainedRows, requestRows] = await Promise.all([
    sequelize.query(
      `
        SELECT DISTINCT ON (cb.nbadge)
          cb.nbadge,
          a.area,
          n.nivel,
          cb.pontos_obtidos,
          b.validade,
          cb.nutilizador
        FROM c_obtem_b AS cb
        INNER JOIN badge AS b
          ON b.nbadge = cb.nbadge
        LEFT JOIN nivel_contem_b AS ncb
          ON ncb.nbadge = cb.nbadge
        LEFT JOIN nivel AS n
          ON n.nnivel = ncb.nnivel
        LEFT JOIN area AS a
          ON a.narea = n.narea
        WHERE cb.nutilizador = :utilizadorId
        ORDER BY cb.nbadge
      `,
      {
        replacements: { utilizadorId },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT DISTINCT ON (p.nbadge)
          p.npedido,
          p.nbadge,
          p.data_submissao,
          e.estado,
          a.area,
          n.nivel
        FROM pedidos AS p
        INNER JOIN estado AS e
          ON e.nestado = p.estado
        LEFT JOIN nivel_contem_b AS ncb
          ON ncb.nbadge = p.nbadge
        LEFT JOIN nivel AS n
          ON n.nnivel = ncb.nnivel
        LEFT JOIN area AS a
          ON a.narea = n.narea
        WHERE p.nutilizador = :utilizadorId
        ORDER BY p.nbadge, p.data_submissao DESC, p.npedido DESC
      `,
      {
        replacements: { utilizadorId },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  const requestIds = requestRows
    .map((row) => Number(row.npedido))
    .filter((requestId) => Number.isInteger(requestId) && requestId > 0);
  const requestBadgeIds = requestRows
    .map((row) => Number(row.nbadge))
    .filter((badgeId) => Number.isInteger(badgeId) && badgeId > 0);

  await ensureRequirementsForBadges(requestBadgeIds);
  const requirementsByBadge = await loadRequirementsByBadgeIds(requestBadgeIds);

  const evidenceRows = requestIds.length > 0
    ? await sequelize.query(
      `
        SELECT
          e.npedido,
          e.nreq,
          e.nevidencias,
          e.nevidencia,
          e.formato
        FROM evidencias AS e
        WHERE e.npedido IN (:requestIds)
        ORDER BY e.npedido ASC, e.nreq ASC, e.nevidencias ASC
      `,
      {
        replacements: { requestIds },
        type: QueryTypes.SELECT,
      },
    )
    : [];

  const evidenceByRequest = new Map();

  for (const row of evidenceRows) {
    const requestId = Number(row.npedido);
    const requirementId = Number(row.nreq);
    const requirementKey = Number.isInteger(requirementId) && requirementId > 0 ? `req-${requirementId}` : null;

    if (!evidenceByRequest.has(requestId)) {
      evidenceByRequest.set(requestId, {
        byRequirement: new Map(),
        unscoped: [],
      });
    }

    const requirementState = evidenceByRequest.get(requestId);
    const labelBase = String(row.nevidencia || 'evidencia').trim();
    const extension = String(row.formato || '').trim();
    const attachmentLabel = extension && !labelBase.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
      ? `${labelBase}.${extension}`
      : labelBase;

    const attachment = {
      id: `evidence-${Number(row.nevidencias) || `${requestId}-${labelBase}`}`,
      evidenceId: Number(row.nevidencias) || null,
      type: extension === 'pdf' ? 'pdf' : 'file',
      label: attachmentLabel,
    };

    if (!requirementKey) {
      requirementState.unscoped.push(attachment);
      continue;
    }

    if (!requirementState.byRequirement.has(requirementKey)) {
      requirementState.byRequirement.set(requirementKey, {
        files: 0,
        attachments: [],
      });
    }

    const requirementItem = requirementState.byRequirement.get(requirementKey);
    requirementItem.files += 1;
    requirementItem.attachments.push(attachment);
  }

  const items = [];
  const existingBadgeIds = new Set();

  for (const row of obtainedRows) {
    const template = resolveBadgeTemplate(row.nivel);
    const badgeId = Number(row.nbadge);
    existingBadgeIds.add(badgeId);

    items.push({
      id: `badge-${badgeId}`,
      badgeDbId: badgeId,
      area: row.area || 'Badge',
      stateId: 'aprovado',
      status: 'obtido',
      levelKey: template.levelKey,
      points: Number(row.pontos_obtidos) || template.points,
      badgeImage: template.badgeImage,
      date: formatDate(row.validade),
    });
  }

  for (const row of requestRows) {
    const badgeId = Number(row.nbadge);
    if (existingBadgeIds.has(badgeId)) {
      continue;
    }

    const template = resolveBadgeTemplate(row.nivel);
    const mappedStatus = mapPedidoEstadoToLearningPathStatus(row.estado);
    const requestId = Number(row.npedido);
    const requestEvidence = evidenceByRequest.get(requestId);
    const badgeRequirements = clone(requirementsByBadge.get(badgeId) || []);

    for (const requirement of badgeRequirements) {
      const requirementEvidence = requestEvidence?.byRequirement?.get(String(requirement.id));
      if (!requirementEvidence) {
        requirement.files = Number(requirement.files) || 0;
        requirement.attachments = Array.isArray(requirement.attachments) ? requirement.attachments : [];
        continue;
      }

      requirement.files = requirementEvidence.files;
      requirement.attachments = requirementEvidence.attachments;
    }

    if (badgeRequirements.length > 0 && requestEvidence?.unscoped?.length) {
      const firstRequirement = badgeRequirements[0];
      firstRequirement.files = Number(firstRequirement.files || 0) + requestEvidence.unscoped.length;
      firstRequirement.attachments = [...(firstRequirement.attachments || []), ...requestEvidence.unscoped];
    }

    items.push({
      id: `badge-${badgeId}`,
      badgeDbId: badgeId,
      requestId,
      area: row.area || 'Badge',
      stateId: mapPedidoEstadoToMyBadgeState(row.estado),
      status: mappedStatus,
      levelKey: template.levelKey,
      points: template.points,
      badgeImage: template.badgeImage,
      date: formatDate(row.data_submissao),
      requirements: badgeRequirements,
      evidence: badgeRequirements,
    });
  }

  return items.sort((left, right) => right.points - left.points);
};

const buildMyRequests = async (accountId) => {
  const utilizadorId = await getUtilizadorIdByAccountId(accountId);
  if (!utilizadorId) {
    return [];
  }

  const rows = await sequelize.query(
    `
      SELECT
        p.npedido,
        p.data_submissao,
        e.estado,
        b.b_nome,
        meta.area,
        meta.nivel
      FROM pedidos AS p
      INNER JOIN estado AS e
        ON e.nestado = p.estado
      LEFT JOIN badge AS b
        ON b.nbadge = p.nbadge
      LEFT JOIN (
        SELECT DISTINCT ON (ncb.nbadge)
          ncb.nbadge,
          a.area,
          n.nivel
        FROM nivel_contem_b AS ncb
        LEFT JOIN nivel AS n
          ON n.nnivel = ncb.nnivel
        LEFT JOIN area AS a
          ON a.narea = n.narea
        ORDER BY ncb.nbadge, n.nnivel ASC
      ) AS meta
        ON meta.nbadge = p.nbadge
      WHERE p.nutilizador = :utilizadorId
      ORDER BY p.data_submissao DESC, p.npedido DESC
    `,
    {
      replacements: { utilizadorId },
      type: QueryTypes.SELECT,
    },
  );

  return rows.map((row) => {
    const level = normalizeLevelTitle(row.nivel) || 'Intermedio';

    return {
      id: Number(row.npedido),
      badge: row.area || row.b_nome || 'Badge',
      level,
      date: formatShortDate(row.data_submissao),
      status: mapPedidoEstadoToMyRequestStatus(row.estado),
    };
  });
};

const getSelectedAreaRowsByUtilizadorId = async (utilizadorId) => {
  if (!utilizadorId) {
    return [];
  }

  return sequelize.query(
    `
      SELECT
        a.narea,
        a.area,
        a.a_desc,
        sl.sline
      FROM preferencias AS p
      INNER JOIN area AS a
        ON a.narea = p.narea
      LEFT JOIN service_line AS sl
        ON sl.nsline = a.nsline
      WHERE p.nutilizador = :utilizadorId
      ORDER BY LOWER(a.area) ASC, a.narea ASC
    `,
    {
      replacements: { utilizadorId: Number(utilizadorId) },
      type: QueryTypes.SELECT,
    },
  );
};

const buildPreferenceAreas = async (accountId) => {
  const utilizadorId = accountId ? await getUtilizadorIdByAccountId(accountId) : null;

  const [areasRows, selectedRows] = await Promise.all([
    sequelize.query(
      `
        SELECT
          a.narea,
          a.area,
          a.a_desc,
          sl.sline,
          COUNT(DISTINCT bpa.nbadge) AS total_badges
        FROM area AS a
        LEFT JOIN service_line AS sl
          ON sl.nsline = a.nsline
        LEFT JOIN b_pertence_a AS bpa
          ON bpa.narea = a.narea
        GROUP BY a.narea, a.area, a.a_desc, sl.sline
        ORDER BY LOWER(a.area) ASC, a.narea ASC
      `,
      {
        type: QueryTypes.SELECT,
      },
    ),
    getSelectedAreaRowsByUtilizadorId(utilizadorId),
  ]);

  const selectedAreaIds = new Set(selectedRows.map((row) => Number(row.narea)));

  return areasRows.map((row) => ({
    id: Number(row.narea),
    name: row.area || 'Area',
    description: row.a_desc || '',
    serviceLine: row.sline || '',
    badgeCount: Number(row.total_badges) || 0,
    selected: selectedAreaIds.has(Number(row.narea)),
  }));
};

const buildUserPreferences = async (accountId) => {
  const utilizadorId = await getUtilizadorIdByAccountId(accountId);
  if (!utilizadorId) {
    return [];
  }

  const rows = await getSelectedAreaRowsByUtilizadorId(utilizadorId);
  return rows.map((row) => ({
    id: Number(row.narea),
    name: row.area || 'Area',
    description: row.a_desc || '',
    serviceLine: row.sline || '',
  }));
};

const saveUserPreferences = async (accountId, areaIds) => {
  const parsedAreaIds = [...new Set(
    (Array.isArray(areaIds) ? areaIds : [])
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0),
  )];

  if (parsedAreaIds.length === 0) {
    const error = new Error('At least one area is required.');
    error.statusCode = 400;
    throw error;
  }

  const utilizadorId = await getUtilizadorIdByAccountId(accountId);
  if (!utilizadorId) {
    const error = new Error('User not found for account.');
    error.statusCode = 404;
    throw error;
  }

  const existingAreaRows = await sequelize.query(
    `
      SELECT narea
      FROM area
      WHERE narea IN (:areaIds)
    `,
    {
      replacements: { areaIds: parsedAreaIds },
      type: QueryTypes.SELECT,
    },
  );

  const existingAreaIds = new Set(existingAreaRows.map((row) => Number(row.narea)));
  if (existingAreaIds.size !== parsedAreaIds.length) {
    const error = new Error('One or more selected areas are invalid.');
    error.statusCode = 400;
    throw error;
  }

  const transaction = await sequelize.transaction();
  try {
    await sequelize.query(
      `
        DELETE FROM preferencias
        WHERE nutilizador = :utilizadorId
      `,
      {
        replacements: { utilizadorId },
        type: QueryTypes.DELETE,
        transaction,
      },
    );

    for (const areaId of parsedAreaIds) {
      await sequelize.query(
        `
          INSERT INTO preferencias (nutilizador, narea)
          VALUES (:utilizadorId, :areaId)
          ON CONFLICT (narea, nutilizador) DO NOTHING
        `,
        {
          replacements: { utilizadorId, areaId },
          type: QueryTypes.INSERT,
          transaction,
        },
      );
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return buildUserPreferences(accountId);
};

const buildBadgeSuggestions = async (accountId, limit = 3) => {
  const safeLimit = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 3;
  const utilizadorId = await getUtilizadorIdByAccountId(accountId);
  if (!utilizadorId) {
    return [];
  }

  const preferredAreas = await getSelectedAreaRowsByUtilizadorId(utilizadorId);
  if (preferredAreas.length === 0) {
    return [];
  }

  const preferredAreaIds = preferredAreas.map((area) => Number(area.narea));

  const [candidateRows, obtainedRows, requestRows] = await Promise.all([
    sequelize.query(
      `
        SELECT DISTINCT ON (b.nbadge)
          b.nbadge,
          a.narea,
          a.area,
          n.nivel
        FROM area AS a
        INNER JOIN nivel AS n
          ON n.narea = a.narea
        INNER JOIN nivel_contem_b AS ncb
          ON ncb.nnivel = n.nnivel
        INNER JOIN badge AS b
          ON b.nbadge = ncb.nbadge
        WHERE a.narea IN (:areaIds)
        ORDER BY b.nbadge ASC
      `,
      {
        replacements: { areaIds: preferredAreaIds },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT nbadge
        FROM c_obtem_b
        WHERE nutilizador = :utilizadorId
      `,
      {
        replacements: { utilizadorId },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT DISTINCT ON (p.nbadge)
          p.nbadge,
          e.estado
        FROM pedidos AS p
        INNER JOIN estado AS e
          ON e.nestado = p.estado
        WHERE p.nutilizador = :utilizadorId
        ORDER BY p.nbadge, p.data_submissao DESC, p.npedido DESC
      `,
      {
        replacements: { utilizadorId },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  const obtainedBadgeIds = new Set(obtainedRows.map((row) => Number(row.nbadge)));
  const requestStatusByBadge = new Map(
    requestRows.map((row) => [Number(row.nbadge), mapPedidoEstadoToLearningPathStatus(row.estado)]),
  );

  const candidateRowsByArea = new Map();
  for (const row of candidateRows) {
    const areaId = Number(row.narea);
    if (!candidateRowsByArea.has(areaId)) {
      candidateRowsByArea.set(areaId, []);
    }

    candidateRowsByArea.get(areaId).push(row);
  }

  for (const rows of candidateRowsByArea.values()) {
    rows.sort((left, right) => {
      const leftTemplate = resolveBadgeTemplate(left.nivel);
      const rightTemplate = resolveBadgeTemplate(right.nivel);
      return rightTemplate.points - leftTemplate.points;
    });
  }

  const suggestions = [];
  const suggestedBadgeIds = new Set();
  for (let index = 0; index < preferredAreas.length; index += 1) {
    if (suggestions.length >= safeLimit) {
      break;
    }

    const area = preferredAreas[index];
    const areaRows = candidateRowsByArea.get(Number(area.narea)) || [];

    const matchedRow = areaRows.find((row) => {
      const badgeId = Number(row.nbadge);
      if (obtainedBadgeIds.has(badgeId)) {
        return false;
      }

      const latestRequestStatus = requestStatusByBadge.get(badgeId);
      return !hasActiveBadgeRequest(latestRequestStatus);
    });

    if (!matchedRow) {
      continue;
    }

    const template = resolveBadgeTemplate(matchedRow.nivel);
    suggestedBadgeIds.add(Number(matchedRow.nbadge));
    suggestions.push({
      title: matchedRow.area || area.area || 'Area',
      subtitleKey: template.levelKey,
      accent: suggestionAccentPalette[index % suggestionAccentPalette.length],
      badgeDbId: Number(matchedRow.nbadge),
    });
  }

  if (suggestions.length < safeLimit) {
    for (let areaIndex = 0; areaIndex < preferredAreas.length; areaIndex += 1) {
      if (suggestions.length >= safeLimit) {
        break;
      }

      const area = preferredAreas[areaIndex];
      const areaRows = candidateRowsByArea.get(Number(area.narea)) || [];

      for (const row of areaRows) {
        if (suggestions.length >= safeLimit) {
          break;
        }

        const badgeId = Number(row.nbadge);
        if (suggestedBadgeIds.has(badgeId) || obtainedBadgeIds.has(badgeId)) {
          continue;
        }

        const latestRequestStatus = requestStatusByBadge.get(badgeId);
        if (hasActiveBadgeRequest(latestRequestStatus)) {
          continue;
        }

        const template = resolveBadgeTemplate(row.nivel);
        suggestedBadgeIds.add(badgeId);
        suggestions.push({
          title: row.area || area.area || 'Area',
          subtitleKey: template.levelKey,
          accent: suggestionAccentPalette[suggestions.length % suggestionAccentPalette.length],
          badgeDbId: badgeId,
        });
      }
    }
  }

  return suggestions;
};

const requestBadgeAcquisition = async (accountId, badgeId) => {
  const parsedBadgeId = Number(badgeId);
  if (!Number.isInteger(parsedBadgeId) || parsedBadgeId <= 0) {
    const error = new Error('Invalid badge id.');
    error.statusCode = 400;
    throw error;
  }

  const utilizadorId = await getUtilizadorIdByAccountId(accountId);
  if (!utilizadorId) {
    const error = new Error('User not found for account.');
    error.statusCode = 404;
    throw error;
  }

  const [badgeExists] = await sequelize.query(
    `
      SELECT nbadge
      FROM badge
      WHERE nbadge = :badgeId
      LIMIT 1
    `,
    {
      replacements: { badgeId: parsedBadgeId },
      type: QueryTypes.SELECT,
    },
  );

  if (!badgeExists) {
    const error = new Error('Badge not found.');
    error.statusCode = 404;
    throw error;
  }

  await ensureRequirementsForBadges([parsedBadgeId]);

  const [alreadyObtained] = await sequelize.query(
    `
      SELECT 1
      FROM c_obtem_b
      WHERE nutilizador = :utilizadorId
        AND nbadge = :badgeId
      LIMIT 1
    `,
    {
      replacements: { utilizadorId, badgeId: parsedBadgeId },
      type: QueryTypes.SELECT,
    },
  );

  if (alreadyObtained) {
    return { status: 'obtido', requestId: null };
  }

  const candidaturaEstadoId = await ensureEstadoId('candidatura_em_progresso');
  const [existingRequest] = await sequelize.query(
    `
      SELECT p.npedido, e.estado
      FROM pedidos AS p
      INNER JOIN estado AS e
        ON e.nestado = p.estado
      WHERE p.nutilizador = :utilizadorId
        AND p.nbadge = :badgeId
      ORDER BY p.data_submissao DESC, p.npedido DESC
      LIMIT 1
    `,
    {
      replacements: { utilizadorId, badgeId: parsedBadgeId },
      type: QueryTypes.SELECT,
    },
  );

  if (existingRequest) {
    const existingRequestId = Number(existingRequest.npedido);
    const existingEstado = normalizePedidoEstado(existingRequest.estado);
    if (existingEstado === pedidoEstados.aprovado) {
      return { status: 'obtido', requestId: existingRequestId };
    }

    if (existingEstado === pedidoEstados.emValidacaoTm || existingEstado === pedidoEstados.emValidacaoSll) {
      return { status: 'em_validacao', requestId: existingRequestId };
    }

    if (
      existingEstado !== pedidoEstados.candidaturaEmProgresso
      && existingEstado !== pedidoEstados.evidenciasInsuficientes
    ) {
      const currentStatus = mapPedidoEstadoToLearningPathStatus(existingEstado);
      return {
        status: currentStatus === 'visualizar' ? 'candidatura_em_progresso' : currentStatus,
        requestId: existingRequestId,
      };
    }

    const nextStatus = pedidoEstados.emValidacaoTm;
    const nextEstadoId = await ensureEstadoId(nextStatus);

    await sequelize.query(
      `
        UPDATE pedidos
        SET estado = :estadoId,
            data_submissao = CURRENT_DATE
        WHERE npedido = :pedidoId
      `,
      {
        replacements: {
          estadoId: nextEstadoId,
          pedidoId: Number(existingRequest.npedido),
        },
        type: QueryTypes.UPDATE,
      },
    );

    return { status: 'em_validacao', requestId: existingRequestId };
  }

  const [createdRequest] = await sequelize.query(
    `
      INSERT INTO pedidos (nbadge, nutilizador, estado, data_submissao)
      VALUES (:badgeId, :utilizadorId, :estadoId, CURRENT_DATE)
      RETURNING npedido
    `,
    {
      replacements: {
        badgeId: parsedBadgeId,
        utilizadorId,
        estadoId: candidaturaEstadoId,
      },
      type: QueryTypes.SELECT,
    },
  );

  return { status: 'candidatura_em_progresso', requestId: Number(createdRequest?.npedido) || null };
};

const mapReminder = (reminder) => ({
  id: reminder.id,
  accountId: reminder.accountId,
  title: reminder.title,
  description: reminder.description,
  date: reminder.date,
  color: reminder.color,
});

const getNextReminderId = async () => {
  const maxId = Number(await Reminder.max('id')) || 0;
  return maxId + 1;
};

const syncReminderIdSequence = async (lastId) => {
  const safeLastId = Number(lastId) > 0 ? Number(lastId) : 1;
  const isCalled = Number(lastId) > 0;

  await sequelize.query(
    "SELECT setval(pg_get_serial_sequence('lembrete', 'nlembrete'), :safeLastId, :isCalled)",
    {
      replacements: { safeLastId, isCalled },
    },
  );
};

const saveEvidences = async (accountId, pedidoId, nreq, fileMeta) => {
  const parsedAccountId = Number(accountId);
  const parsedPedido = Number(pedidoId);
  let parsedNreq = Number(nreq) || null;

  if (!Number.isInteger(parsedAccountId) || parsedAccountId <= 0) {
    const error = new Error('Invalid account id.');
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(parsedPedido) || parsedPedido <= 0) {
    const error = new Error('Invalid pedido id.');
    error.statusCode = 400;
    throw error;
  }

  const utilizadorId = await getUtilizadorIdByAccountId(parsedAccountId);
  if (!utilizadorId) {
    const error = new Error('User not found for account.');
    error.statusCode = 404;
    throw error;
  }

  const [requestRow] = await sequelize.query(
    `
      SELECT npedido, nbadge
      FROM pedidos
      WHERE npedido = :pedidoId
        AND nutilizador = :utilizadorId
      LIMIT 1
    `,
    {
      replacements: { pedidoId: parsedPedido, utilizadorId },
      type: QueryTypes.SELECT,
    },
  );

  if (!requestRow) {
    const error = new Error('Request not found for account.');
    error.statusCode = 404;
    throw error;
  }

  if (Number.isInteger(parsedNreq) && parsedNreq > 0) {
    const [requirementRow] = await sequelize.query(
      `
        SELECT 1
        FROM requisitos
        WHERE nreq = :nreq
          AND nbadge = :badgeId
        LIMIT 1
      `,
      {
        replacements: {
          nreq: parsedNreq,
          badgeId: Number(requestRow.nbadge),
        },
        type: QueryTypes.SELECT,
      },
    );

    if (!requirementRow) {
      parsedNreq = null;
    }
  }

  const nevidencia = String(fileMeta.filename || fileMeta.originalName || 'evidence').slice(0, 50);
  const formato = String(fileMeta.formato || '').slice(0, 50);

  const [inserted] = await sequelize.query(
    `
      INSERT INTO evidencias (nevidencia, e_data_submissao, formato, nreq, npedido)
      VALUES (:nevidencia, CURRENT_DATE, :formato, :nreq, :npedido)
      RETURNING nevidencias, nevidencia, formato, nreq, npedido
    `,
    {
      replacements: {
        nevidencia,
        formato,
        nreq: parsedNreq,
        npedido: parsedPedido,
      },
      type: QueryTypes.SELECT,
    },
  );

  return inserted || {
    nevidencia,
    formato,
    nreq: parsedNreq,
    npedido: parsedPedido,
  };
};

export const consultorModel = {
  async getCatalogBadges() {
    const rawBadges = await sequelize.query(
      `
        SELECT
          b.nbadge,
          a.area,
          n.nivel,
          sl.sline
        FROM badge AS b
        LEFT JOIN nivel_contem_b AS ncb
          ON b.nbadge = ncb.nbadge
        LEFT JOIN nivel AS n
          ON ncb.nnivel = n.nnivel
        LEFT JOIN area AS a
          ON n.narea = a.narea
        LEFT JOIN service_line AS sl
          ON a.nsline = sl.nsline
        ORDER BY b.nbadge ASC
      `,
      { type: QueryTypes.SELECT }
    );

    const items = rawBadges.map((row) => {
      const template = resolveBadgeTemplate(row.nivel);
      return {
        id: `badge-${row.nbadge}`,
        badgeDbId: Number(row.nbadge),
        area: row.area || 'Diversos',
        stateId: 'candidatura_aberta',
        status: 'visualizar',
        levelKey: template.levelKey,
        points: template.points,
        badgeImage: template.badgeImage,
        learningPathName: 'Jornada Técnica',
        serviceLineName: row.sline || 'Application Operations',
      };
    });

    return items;
  },

  async getLearningPaths(accountId) {
    const data = await buildLearningPaths(accountId);
    return clone(data);
  },

  async getMyBadges(accountId) {
    const data = await buildMyBadges(accountId);
    return clone(data);
  },

  async requestBadgeAcquisition(accountId, badgeId) {
    const data = await requestBadgeAcquisition(accountId, badgeId);
    return clone(data);
  },

  async getPreferenceAreas(accountId) {
    const data = await buildPreferenceAreas(accountId);
    return clone(data);
  },

  async getPreferences(accountId) {
    const data = await buildUserPreferences(accountId);
    return clone(data);
  },

  async savePreferences(accountId, areaIds) {
    const data = await saveUserPreferences(accountId, areaIds);
    return clone(data);
  },

  async getBadgeSuggestions(accountId, limit) {
    const data = await buildBadgeSuggestions(accountId, limit);
    return clone(data);
  },

  async getMyRequests(accountId) {
    const data = await buildMyRequests(accountId);
    return clone(data);
  },

  async getRankingConsultores() {
    const data = await buildRankingConsultores();
    return clone(data);
  },

  async getReminders(accountId) {
    const reminders = await Reminder.findAll({
      where: { accountId: Number(accountId) },
      order: [['date', 'ASC']],
    });

    return reminders.map(mapReminder);
  },

  async createReminder(accountId, payload) {
    const nextReminderId = await getNextReminderId();

    const reminder = await Reminder.create({
      id: nextReminderId,
      accountId: Number(accountId),
      title: payload.title.trim(),
      description: payload.description.trim(),
      date: payload.date,
      color: payload.color,
    });

    await syncReminderIdSequence(nextReminderId);

    return mapReminder(reminder);
  },

  async updateReminder(id, accountId, payload) {
    const reminder = await Reminder.findOne({ where: { id: Number(id), accountId: Number(accountId) } });
    if (!reminder) {
      return null;
    }

    await reminder.update({
      title: payload.title.trim(),
      description: payload.description.trim(),
      date: payload.date,
      color: payload.color,
    });

    return mapReminder(reminder);
  },

  async deleteReminder(id, accountId) {
    const deletedRows = await Reminder.destroy({ where: { id: Number(id), accountId: Number(accountId) } });
    return deletedRows > 0;
  },

  async getProfileData(accountId) {
    const data = await buildProfileData(accountId);
    return clone(data);
  },
  async saveEvidences(accountId, pedidoId, nreq, fileMeta) {
    const data = await saveEvidences(accountId, pedidoId, nreq, fileMeta);
    return clone(data);
  },

  async getBadgeRequirements(badgeId) {
    const parsedBadgeId = Number(badgeId);
    if (!Number.isInteger(parsedBadgeId) || parsedBadgeId <= 0) {
      return [];
    }

    const rows = await sequelize.query(
      `
        SELECT nreq, requisito, r_descricao
        FROM requisitos
        WHERE nbadge = :badgeId
        ORDER BY nreq ASC
      `,
      {
        replacements: { badgeId: parsedBadgeId },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((row) => ({
      id: `req-${Number(row.nreq)}`,
      title: row.requisito || 'Requisito',
      description: row.r_descricao || 'Texto de suporte do requisito associado a candidatura.',
      files: 0,
      attachments: [],
    }));
  },
};
