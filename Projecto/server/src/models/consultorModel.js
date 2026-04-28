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

const catalogBadges = [
  {
    id: 'lowcode-junior',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_junior',
    points: 100,
    badgeImage: '/badges/J%C3%BAnior.png',
    date: '12 Jan 2026',
  },
  {
    id: 'lowcode-intermediate',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '12 Jan 2026',
  },
  {
    id: 'lowcode-senior',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '12 Jan 2026',
  },
  {
    id: 'lowcode-specialist',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '12 Jan 2026',
  },
  {
    id: 'lowcode-knowledge-lead',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_knowledge_lead',
    points: 300,
    badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-junior',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_junior',
    points: 100,
    badgeImage: '/badges/J%C3%BAnior.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-intermediate',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-senior',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-specialist',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-knowledge-lead',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_knowledge_lead',
    points: 300,
    badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png',
    date: '12 Jan 2026',
  },
];

const myRequests = [
  { id: 1, badge: 'UX/UI Design', level: 'Especialista', date: '05/12/2025', status: 'pendente' },
  { id: 2, badge: 'Data Analytics', level: 'Intermedio', date: '04/12/2025', status: 'rejeitado' },
  { id: 3, badge: 'Cloud Architecture', level: 'Senior', date: '03/12/2025', status: 'aprovado' },
  { id: 4, badge: 'LowCode (Outsystems)', level: 'Junior', date: '01/12/2025', status: 'pendente' },
  { id: 5, badge: 'DevOps', level: 'Intermedio', date: '30/11/2025', status: 'pendente' },
  { id: 6, badge: 'Cybersecurity', level: 'Lider de Conhecimento', date: '28/11/2025', status: 'aprovado' },
  { id: 7, badge: 'Machine Learning', level: 'Senior', date: '25/11/2025', status: 'aprovado' },
  { id: 8, badge: 'Mobile Development', level: 'Junior', date: '22/11/2025', status: 'rejeitado' },
  { id: 9, badge: 'Blockchain', level: 'Especialista', date: '20/11/2025', status: 'aprovado' },
  { id: 10, badge: 'IoT Solutions', level: 'Intermedio', date: '18/11/2025', status: 'pendente' },
];

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

  getMyRequests() {
    return clone(myRequests);
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
