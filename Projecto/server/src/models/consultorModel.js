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
          SELECT p.nbadge, e.estado
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
  const requestStatusMap = new Map();
  for (const r of userRequests) {
    const badgeId = Number(r.nbadge);
    if (!requestStatusMap.has(badgeId)) {
      requestStatusMap.set(badgeId, mapPedidoEstadoToLearningPathStatus(r.estado));
    }
  }

  const getStatusForBadge = (nbadge) => {
    if (!nbadge) return 'visualizar';
    if (obtainedBadgeIds.has(nbadge)) return 'obtido';
    if (requestStatusMap.has(Number(nbadge))) return requestStatusMap.get(Number(nbadge));
    return 'visualizar';
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
      area.levels.push({
        id: `nivel-${Number(row.nnivel)}`,
        title: normalizeLevelTitle(row.nivel),
        subtitle: `Nivel ${area.levels.length + 1}`,
        ...template,
        badgeDbId: row.nbadge ? Number(row.nbadge) : null,
        status: getStatusForBadge(row.nbadge),
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

    items.push({
      id: `badge-${badgeId}`,
      badgeDbId: badgeId,
      area: row.area || 'Badge',
      stateId: mapPedidoEstadoToMyBadgeState(row.estado),
      status: mappedStatus,
      levelKey: template.levelKey,
      points: template.points,
      badgeImage: template.badgeImage,
      date: formatDate(row.data_submissao),
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
    return { status: 'obtido' };
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
    const existingEstado = normalizePedidoEstado(existingRequest.estado);
    if (existingEstado === pedidoEstados.aprovado) {
      return { status: 'obtido' };
    }

    if (existingEstado === pedidoEstados.emValidacaoTm || existingEstado === pedidoEstados.emValidacaoSll) {
      return { status: 'em_validacao' };
    }

    if (
      existingEstado !== pedidoEstados.candidaturaEmProgresso
      && existingEstado !== pedidoEstados.evidenciasInsuficientes
    ) {
      const currentStatus = mapPedidoEstadoToLearningPathStatus(existingEstado);
      return { status: currentStatus === 'visualizar' ? 'candidatura_em_progresso' : currentStatus };
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

    return { status: 'em_validacao' };
  }

  await sequelize.query(
    `
      INSERT INTO pedidos (nbadge, nutilizador, estado, data_submissao)
      VALUES (:badgeId, :utilizadorId, :estadoId, CURRENT_DATE)
    `,
    {
      replacements: {
        badgeId: parsedBadgeId,
        utilizadorId,
        estadoId: candidaturaEstadoId,
      },
      type: QueryTypes.INSERT,
    },
  );

  return { status: 'candidatura_em_progresso' };
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
    "SELECT setval(pg_get_serial_sequence('reminders', 'id'), :safeLastId, :isCalled)",
    {
      replacements: { safeLastId, isCalled },
    },
  );
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

  getRankingConsultores() {
    return clone(rankingConsultores);
  },

  async getReminders(accountId) {
    const reminders = await Reminder.findAll({
      where: { accountId: Number(accountId) },
      order: [['createdAt', 'DESC']],
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

  getProfileData() {
    return clone(profileData);
  },
};
