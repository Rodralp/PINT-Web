import { QueryTypes } from 'sequelize';
import path from 'node:path';
import { sequelize } from '../config/database.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
const GLOBAL_SERVICE_LINE_ACCESS_USER_IDS = new Set([5]);

const roleSet = new Set(['talent-manager', 'service-line-leader', 'admin-gestor']);
const pedidoEstados = Object.freeze({
  candidaturaEmProgresso: 'candidatura_em_progresso',
  emValidacaoTm: 'em_validacao',
  emValidacaoSll: 'em_validacao_sll',
  evidenciasInsuficientes: 'evidencias_insuficientes',
  aprovado: 'aprovado',
});

const badgeLevelTemplates = [
  {
    points: 100,
    badgeImage: '/badges/J%C3%BAnior.png',
  },
  {
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
  },
  {
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
  },
  {
    points: 250,
    badgeImage: '/badges/Especialista.png',
  },
  {
    points: 300,
    badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png',
  },
];

const parseRole = (role) => {
  const normalizedRole = String(role || '').trim().toLowerCase();
  return roleSet.has(normalizedRole) ? normalizedRole : null;
};

const normalizeLevelTitle = (value) => {
  const rawTitle = String(value || '').trim();
  const withoutPathPrefix = rawTitle.includes(' - ')
    ? rawTitle.split(' - ').slice(1).join(' - ').trim()
    : rawTitle;

  return withoutPathPrefix.replace(/^nivel\s+/i, '').trim();
};

const resolveLevelTemplate = (levelName) => {
  const normalized = String(levelName || '').trim().toLowerCase();

  if (normalized.includes('junior')) {
    return badgeLevelTemplates[0];
  }

  if (normalized.includes('intermedio') || normalized.includes('interm')) {
    return badgeLevelTemplates[1];
  }

  if (normalized.includes('senior')) {
    return badgeLevelTemplates[2];
  }

  if (normalized.includes('especialista')) {
    return badgeLevelTemplates[3];
  }

  if (normalized.includes('lider')) {
    return badgeLevelTemplates[4];
  }

  return badgeLevelTemplates[1];
};

const getRequirementPrefix = (levelName) => {
  const normalized = String(levelName || '').trim().toLowerCase();

  if (normalized.includes('junior')) return 'A';
  if (normalized.includes('intermedio') || normalized.includes('interm')) return 'B';
  if (normalized.includes('senior')) return 'C';
  if (normalized.includes('especialista')) return 'D';
  return 'E';
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('pt-PT');
};

const formatLongDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return 'Data indisponível';
  }

  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const buildAvatar = (seed) => `https://i.pravatar.cc/120?u=${encodeURIComponent(String(seed || 'user').toLowerCase())}`;

const normalizePedidoEstado = (estadoNome) => String(estadoNome || '').trim().toLowerCase();

const isApprovedRequest = (estadoNome, obtido) => (
  Boolean(obtido) || normalizePedidoEstado(estadoNome) === pedidoEstados.aprovado
);

const buildRoleStatusClause = (role) => {
  if (role === 'service-line-leader') {
    return `
      LOWER(e.estado) IN (
        '${pedidoEstados.emValidacaoSll}',
        '${pedidoEstados.evidenciasInsuficientes}',
        '${pedidoEstados.aprovado}'
      )
    `;
  }

  return `LOWER(e.estado) <> '${pedidoEstados.candidaturaEmProgresso}'`;
};

const mapRowStatus = (estadoNome, obtido, role) => {
  const normalizedEstado = normalizePedidoEstado(estadoNome);

  if (isApprovedRequest(normalizedEstado, obtido)) {
    return 'aprovado';
  }

  if (normalizedEstado === pedidoEstados.evidenciasInsuficientes) {
    return 'rejeitado';
  }

  if (role === 'talent-manager') {
    return normalizedEstado === pedidoEstados.emValidacaoTm ? 'validacao' : 'aprovado';
  }

  if (role === 'service-line-leader') {
    return normalizedEstado === pedidoEstados.emValidacaoSll ? 'validacao' : 'aprovado';
  }

  if (role === 'admin-gestor') {
    return normalizedEstado === pedidoEstados.emValidacaoTm || normalizedEstado === pedidoEstados.emValidacaoSll
      ? 'validacao'
      : 'aprovado';
  }

  return 'validacao';
};

const mapTableStatus = (status) => {
  if (status === 'aprovado') return 'aprovado';
  if (status === 'rejeitado') return 'rejeitado';
  return 'pendente';
};

const buildStatusNote = (status, estadoNome, description) => {
  const customDescription = String(description || '').trim();
  if (customDescription) {
    return customDescription;
  }

  const normalizedEstado = normalizePedidoEstado(estadoNome);

  if (normalizedEstado === pedidoEstados.emValidacaoSll) {
    return 'Candidatura validada pelo Talent Manager e enviada para SLL.';
  }

  if (normalizedEstado === pedidoEstados.emValidacaoTm) {
    return 'Candidatura submetida e em validação.';
  }

  if (status === 'rejeitado') {
    return 'Evidências insuficientes para a conclusão da submissão.';
  }

  if (status === 'aprovado') {
    return 'Candidatura aprovada com base nas evidências submetidas.';
  }

  return 'Candidatura submetida e em validação.';
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

const buildRequirements = async (pedidoId, badgeId, levelName) => {
  const [requirementsRows, evidenceRows] = await Promise.all([
    sequelize.query(
      `
        SELECT nreq, requisito, r_descricao
        FROM requisitos
        WHERE nbadge = :badgeId
        ORDER BY nreq ASC
      `,
      {
        replacements: { badgeId: Number(badgeId) },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT nevidencias, nreq, nevidencia, formato
        FROM evidencias
        WHERE npedido = :pedidoId
        ORDER BY nreq ASC, nevidencias ASC
      `,
      {
        replacements: { pedidoId: Number(pedidoId) },
        type: QueryTypes.SELECT,
      },
    ),
  ]);

  const evidenceByReq = new Map();
  const unscopedAttachments = [];

  for (const row of evidenceRows) {
    const requirementId = Number(row.nreq);
    const extension = String(row.formato || '').trim().toLowerCase();
    const labelBase = String(row.nevidencia || 'evidencia').trim();
    const label = extension && !labelBase.toLowerCase().endsWith(`.${extension}`)
      ? `${labelBase}.${extension}`
      : labelBase;
    const attachment = {
      id: `evidence-${Number(row.nevidencias) || label}`,
      evidenceId: Number(row.nevidencias) || null,
      type: extension === 'pdf' ? 'pdf' : 'file',
      label,
    };

    if (!Number.isInteger(requirementId) || requirementId <= 0) {
      unscopedAttachments.push(attachment);
      continue;
    }

    if (!evidenceByReq.has(requirementId)) {
      evidenceByReq.set(requirementId, []);
    }

    evidenceByReq.get(requirementId).push(attachment);
  }

  const requirements = [];
  if (requirementsRows.length > 0) {
    for (let index = 0; index < requirementsRows.length; index += 1) {
      const row = requirementsRows[index];
      const requirementId = Number(row.nreq);
      const attachments = evidenceByReq.get(requirementId) || [];
      const files = attachments.length;

      requirements.push({
        id: `req-${requirementId}`,
        title: row.requisito,
        description: row.r_descricao,
        files,
        attachments,
      });
    }

    if (requirements.length > 0 && unscopedAttachments.length > 0) {
      requirements[0].files += unscopedAttachments.length;
      requirements[0].attachments = [...requirements[0].attachments, ...unscopedAttachments];
    }

    return requirements;
  }

  const prefix = getRequirementPrefix(levelName);
  const fallbackTitles = [
    'Implementar conectividade híbrida',
    'Monitorizar infraestrutura híbrida',
    'Implementar disaster recovery',
  ];

  for (let index = 0; index < fallbackTitles.length; index += 1) {
    requirements.push({
      id: `fallback-${index + 1}`,
      title: `${prefix}${index + 1} - ${fallbackTitles[index]}`,
      description: 'Texto de suporte do requisito associado à candidatura.',
      files: 0,
      attachments: [],
    });
  }

  if (requirements.length > 0 && unscopedAttachments.length > 0) {
    requirements[0].files = unscopedAttachments.length;
    requirements[0].attachments = unscopedAttachments;
  }

  return requirements;
};

const buildRoleJoin = (role) => {
  if (role === 'service-line-leader') {
    return `
      INNER JOIN b_pertence_sl AS bsl
        ON bsl.nbadge = p.nbadge
      INNER JOIN sll_leader_sl AS sll
        ON sll.nsline = bsl.nsline
       AND (
         sll.nutilizador = :actorUtilizadorId
         OR :hasGlobalServiceLineAccess = TRUE
       )
    `;
  }

  return '';
};

const fetchRequestRows = async ({ role, actorUtilizadorId, requestId = null }) => {
  const roleJoin = buildRoleJoin(role);
  const roleStatusClause = buildRoleStatusClause(role);
  const hasGlobalServiceLineAccess = GLOBAL_SERVICE_LINE_ACCESS_USER_IDS.has(Number(actorUtilizadorId));
  const whereClause = requestId
    ? `WHERE p.npedido = :requestId AND ${roleStatusClause}`
    : `WHERE ${roleStatusClause}`;
  const replacements = requestId
    ? {
      actorUtilizadorId,
      hasGlobalServiceLineAccess,
      requestId: Number(requestId),
    }
    : {
      actorUtilizadorId,
      hasGlobalServiceLineAccess,
    };

  const query = requestId
    ? `
      SELECT
        p.npedido,
        p.nutilizador AS consultor_id,
        p.nbadge,
        p.data_submissao,
        p.descricao,
        e.estado AS estado_nome,
        u.nome AS consultor_nome,
        b.b_nome AS badge_nome,
        b.validade AS badge_validade,
        COALESCE(NULLIF(b.pontos, 0), 0) AS badge_pontos,
        n.nivel AS nivel_nome,
        a.area AS area_nome,
        sl.sline AS service_line_nome,
        lp.lpath AS learning_path_nome,
        CASE WHEN cb.nbadge IS NULL THEN FALSE ELSE TRUE END AS obtido
      FROM pedidos AS p
      ${roleJoin}
      INNER JOIN estado AS e
        ON e.nestado = p.estado
      INNER JOIN utilizador AS u
        ON u.nutilizador = p.nutilizador
      LEFT JOIN badge AS b
        ON b.nbadge = p.nbadge
      LEFT JOIN nivel_contem_b AS ncb
        ON ncb.nbadge = p.nbadge
      LEFT JOIN nivel AS n
        ON n.nnivel = ncb.nnivel
      LEFT JOIN area AS a
        ON a.narea = n.narea
      LEFT JOIN service_line AS sl
        ON sl.nsline = a.nsline
      LEFT JOIN learning_path AS lp
        ON lp.nlpath = sl.nlpath
      LEFT JOIN c_obtem_b AS cb
        ON cb.nutilizador = p.nutilizador
       AND cb.nbadge = p.nbadge
      ${whereClause}
      LIMIT 1
    `
    : `
      WITH latest AS (
        SELECT DISTINCT ON (p.nutilizador, p.nbadge)
          p.npedido
        FROM pedidos AS p
        ORDER BY p.nutilizador, p.nbadge, p.data_submissao DESC, p.npedido DESC
      )
      SELECT
        p.npedido,
        p.nutilizador AS consultor_id,
        p.nbadge,
        p.data_submissao,
        p.descricao,
        e.estado AS estado_nome,
        u.nome AS consultor_nome,
        b.b_nome AS badge_nome,
        b.validade AS badge_validade,
        COALESCE(NULLIF(b.pontos, 0), 0) AS badge_pontos,
        n.nivel AS nivel_nome,
        a.area AS area_nome,
        sl.sline AS service_line_nome,
        lp.lpath AS learning_path_nome,
        CASE WHEN cb.nbadge IS NULL THEN FALSE ELSE TRUE END AS obtido
      FROM latest AS l
      INNER JOIN pedidos AS p
        ON p.npedido = l.npedido
      ${roleJoin}
      INNER JOIN estado AS e
        ON e.nestado = p.estado
      INNER JOIN utilizador AS u
        ON u.nutilizador = p.nutilizador
      LEFT JOIN badge AS b
        ON b.nbadge = p.nbadge
      LEFT JOIN nivel_contem_b AS ncb
        ON ncb.nbadge = p.nbadge
      LEFT JOIN nivel AS n
        ON n.nnivel = ncb.nnivel
      LEFT JOIN area AS a
        ON a.narea = n.narea
      LEFT JOIN service_line AS sl
        ON sl.nsline = a.nsline
      LEFT JOIN learning_path AS lp
        ON lp.nlpath = sl.nlpath
      LEFT JOIN c_obtem_b AS cb
        ON cb.nutilizador = p.nutilizador
       AND cb.nbadge = p.nbadge
      ${whereClause}
      ORDER BY p.data_submissao DESC, p.npedido DESC
    `;

  return sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT,
  });
};

const mapRequestListItem = (row, role) => {
  const levelTitle = normalizeLevelTitle(row.nivel_nome) || 'Intermédio';
  const levelTemplate = resolveLevelTemplate(levelTitle);
  const status = mapRowStatus(row.estado_nome, row.obtido, role);

  return {
    id: Number(row.npedido),
    consultant: row.consultor_nome,
    badge: row.area_nome || row.badge_nome || 'Badge',
    level: levelTitle,
    levelLabel: `Nível ${levelTitle}`,
    area: row.learning_path_nome || 'Jornada Técnica',
    path: row.service_line_nome || 'Service Line',
    date: formatDate(row.data_submissao),
    status,
    tableStatus: mapTableStatus(status),
    points: Number(row.badge_pontos) > 0 ? Number(row.badge_pontos) : levelTemplate.points,
    badgeImage: levelTemplate.badgeImage,
  };
};

const mapRequestDetails = async (row, role) => {
  const baseItem = mapRequestListItem(row, role);
  const requirements = await buildRequirements(row.npedido, row.nbadge, baseItem.level);
  const status = baseItem.status;

  const reviewerByRole = role === 'service-line-leader'
    ? 'Talent Manager'
    : role === 'admin-gestor'
      ? 'Administrador / Gestor'
      : 'Talent Manager';

  return {
    ...baseItem,
    badgeDbId: Number(row.nbadge),
    expiresAt: formatDate(row.badge_validade),
    submittedBy: row.consultor_nome,
    submittedByAvatar: buildAvatar(`consultor-${row.consultor_id}`),
    submittedDate: formatLongDate(row.data_submissao),
    reviewer: reviewerByRole,
    reviewerAvatar: buildAvatar(`reviewer-${role}`),
    reviewerDate: formatLongDate(row.data_submissao),
    notes: buildStatusNote(status, row.estado_nome, row.descricao),
    finalReviewer: status === 'aprovado' ? reviewerByRole : null,
    finalReviewerAvatar: status === 'aprovado' ? buildAvatar(`final-${role}`) : null,
    finalReviewerDate: status === 'aprovado' ? formatLongDate(row.data_submissao) : null,
    evidence: requirements,
  };
};

const getRequestByIdForRole = async (role, actorUtilizadorId, requestId) => {
  const [row] = await fetchRequestRows({ role, actorUtilizadorId, requestId });
  return row || null;
};

const ensureRoleAccessToRequest = async (role, actorUtilizadorId, request) => {
  if (role !== 'service-line-leader') {
    return true;
  }

  if (GLOBAL_SERVICE_LINE_ACCESS_USER_IDS.has(Number(actorUtilizadorId))) {
    return true;
  }

  const [hasAccess] = await sequelize.query(
    `
      SELECT 1
      FROM b_pertence_sl AS bsl
      INNER JOIN sll_leader_sl AS sll
        ON sll.nsline = bsl.nsline
      WHERE bsl.nbadge = :badgeId
        AND sll.nutilizador = :actorUtilizadorId
      LIMIT 1
    `,
    {
      replacements: {
        badgeId: Number(request.nbadge),
        actorUtilizadorId: Number(actorUtilizadorId),
      },
      type: QueryTypes.SELECT,
    },
  );

  return Boolean(hasAccess);
};

const insertManagerOwnership = async (role, actorUtilizadorId, requestId) => {
  if (role === 'talent-manager') {
    await sequelize.query(
      `
        INSERT INTO tm_gere_p (tm_nutilizador, npedido)
        VALUES (:actorUtilizadorId, :requestId)
        ON CONFLICT (tm_nutilizador, npedido) DO NOTHING
      `,
      {
        replacements: { actorUtilizadorId: Number(actorUtilizadorId), requestId: Number(requestId) },
        type: QueryTypes.INSERT,
      },
    );
    return;
  }

  if (role === 'service-line-leader') {
    await sequelize.query(
      `
        INSERT INTO sll_gere_p (ser_nutilizador, npedido)
        VALUES (:actorUtilizadorId, :requestId)
        ON CONFLICT (ser_nutilizador, npedido) DO NOTHING
      `,
      {
        replacements: { actorUtilizadorId: Number(actorUtilizadorId), requestId: Number(requestId) },
        type: QueryTypes.INSERT,
      },
    );
    return;
  }

  if (role === 'admin-gestor') {
    await sequelize.query(
      `
        INSERT INTO adm_gere_p (adm_nutilizador, npedido)
        VALUES (:actorUtilizadorId, :requestId)
        ON CONFLICT (adm_nutilizador, npedido) DO NOTHING
      `,
      {
        replacements: { actorUtilizadorId: Number(actorUtilizadorId), requestId: Number(requestId) },
        type: QueryTypes.INSERT,
      },
    );
  }
};

const applyDecision = async ({ role, request, decision, comment }) => {
  const decisionKey = String(decision || '').trim().toLowerCase();
  const allowedDecisions = new Set(['aprovar', 'rejeitar']);

  if (!allowedDecisions.has(decisionKey)) {
    const error = new Error('Decision is not allowed for this role.');
    error.statusCode = 400;
    throw error;
  }

  const currentEstado = normalizePedidoEstado(request.estado_nome);

  if (role === 'talent-manager' && currentEstado !== pedidoEstados.emValidacaoTm) {
    const error = new Error('Request is not pending Talent Manager validation.');
    error.statusCode = 409;
    throw error;
  }

  if (role === 'service-line-leader' && currentEstado !== pedidoEstados.emValidacaoSll) {
    const error = new Error('Request is not pending Service Line Leader validation.');
    error.statusCode = 409;
    throw error;
  }

  if (role === 'admin-gestor') {
    const canAdminReview = currentEstado === pedidoEstados.emValidacaoTm
      || currentEstado === pedidoEstados.emValidacaoSll;

    if (!canAdminReview) {
      const error = new Error('Request is not in a submitted state for admin review.');
      error.statusCode = 409;
      throw error;
    }

    if (isApprovedRequest(currentEstado, request.obtido)) {
      const error = new Error('Request is already approved.');
      error.statusCode = 409;
      throw error;
    }
  }

  let targetEstado = null;
  let shouldObtainBadge = false;
  let defaultDescription = '';

  if (decisionKey === 'rejeitar') {
    targetEstado = pedidoEstados.evidenciasInsuficientes;
    defaultDescription = role === 'talent-manager'
      ? 'Candidatura rejeitada pelo Talent Manager.'
      : role === 'service-line-leader'
        ? 'Candidatura rejeitada pelo Service Line Leader.'
        : 'Candidatura rejeitada pelo Administrador/Gestor.';
  } else if (decisionKey === 'aprovar' && role === 'talent-manager') {
    targetEstado = pedidoEstados.emValidacaoSll;
    defaultDescription = 'Candidatura validada pelo Talent Manager e enviada para SLL.';
  } else if (decisionKey === 'aprovar' && (role === 'service-line-leader' || role === 'admin-gestor')) {
    targetEstado = pedidoEstados.aprovado;
    shouldObtainBadge = true;
    defaultDescription = role === 'service-line-leader'
      ? 'Candidatura aprovada pelo Service Line Leader.'
      : 'Candidatura aprovada pelo Administrador/Gestor.';
  }

  if (!targetEstado) {
    const error = new Error('Unable to resolve next workflow state.');
    error.statusCode = 500;
    throw error;
  }

  const estadoId = await ensureEstadoId(targetEstado);
  const description = String(comment || '').trim();

  await sequelize.query(
    `
      UPDATE pedidos
      SET estado = :estadoId,
          descricao = :descricao
      WHERE npedido = :requestId
    `,
    {
      replacements: {
        estadoId,
        descricao: description || defaultDescription,
        requestId: Number(request.npedido),
      },
      type: QueryTypes.UPDATE,
    },
  );

  if (!shouldObtainBadge) {
    return;
  }

  const [badgePointsRow] = await sequelize.query(
    `
      SELECT COALESCE(NULLIF(pontos, 0), 100) AS pontos
      FROM badge
      WHERE nbadge = :badgeId
      LIMIT 1
    `,
    {
      replacements: { badgeId: Number(request.nbadge) },
      type: QueryTypes.SELECT,
    },
  );

  const points = Number(badgePointsRow?.pontos) || 100;
  const consultorId = Number(request.consultor_id ?? request.nutilizador);

  if (!Number.isInteger(consultorId) || consultorId <= 0) {
    const error = new Error('Unable to identify request consultant.');
    error.statusCode = 500;
    throw error;
  }

  await sequelize.query(
    `
      INSERT INTO c_obtem_b (nutilizador, nbadge, pontos_obtidos)
      VALUES (:consultorId, :badgeId, :points)
      ON CONFLICT (nutilizador, nbadge) DO NOTHING
    `,
    {
      replacements: {
        consultorId,
        badgeId: Number(request.nbadge),
        points,
      },
      type: QueryTypes.INSERT,
    },
  );
};

export const requestManagementModel = {
  async getManagedRequests(role, accountId) {
    const parsedRole = parseRole(role);
    if (!parsedRole) {
      const error = new Error('Invalid role.');
      error.statusCode = 400;
      throw error;
    }

    const actorUtilizadorId = await getUtilizadorIdByAccountId(accountId);
    if (!actorUtilizadorId) {
      const error = new Error('User not found for account.');
      error.statusCode = 404;
      throw error;
    }

    const rows = await fetchRequestRows({ role: parsedRole, actorUtilizadorId });
    const items = rows.map((row) => mapRequestListItem(row, parsedRole));
    return clone(items);
  },

  async getManagedRequestById(role, accountId, requestId) {
    const parsedRole = parseRole(role);
    if (!parsedRole) {
      const error = new Error('Invalid role.');
      error.statusCode = 400;
      throw error;
    }

    const actorUtilizadorId = await getUtilizadorIdByAccountId(accountId);
    if (!actorUtilizadorId) {
      const error = new Error('User not found for account.');
      error.statusCode = 404;
      throw error;
    }

    const row = await getRequestByIdForRole(parsedRole, actorUtilizadorId, requestId);
    if (!row) {
      return null;
    }

    const item = await mapRequestDetails(row, parsedRole);
    return clone(item);
  },

  async getManagedEvidenceFile(role, accountId, requestId, evidenceId) {
    const parsedRole = parseRole(role);
    if (!parsedRole) {
      const error = new Error('Invalid role.');
      error.statusCode = 400;
      throw error;
    }

    const actorUtilizadorId = await getUtilizadorIdByAccountId(accountId);
    if (!actorUtilizadorId) {
      const error = new Error('User not found for account.');
      error.statusCode = 404;
      throw error;
    }

    const row = await getRequestByIdForRole(parsedRole, actorUtilizadorId, requestId);
    if (!row) {
      return null;
    }

    const hasAccess = await ensureRoleAccessToRequest(parsedRole, actorUtilizadorId, row);
    if (!hasAccess) {
      const error = new Error('You are not allowed to download evidences from this request.');
      error.statusCode = 403;
      throw error;
    }

    const [evidence] = await sequelize.query(
      `
        SELECT nevidencias, nevidencia, formato
        FROM evidencias
        WHERE nevidencias = :evidenceId
          AND npedido = :requestId
        LIMIT 1
      `,
      {
        replacements: {
          evidenceId: Number(evidenceId),
          requestId: Number(requestId),
        },
        type: QueryTypes.SELECT,
      },
    );

    if (!evidence) {
      return null;
    }

    const storedName = path.basename(String(evidence.nevidencia || '').trim());
    if (!storedName) {
      return null;
    }

    const extension = String(evidence.formato || '').trim().toLowerCase();
    const downloadName = extension && !storedName.toLowerCase().endsWith(`.${extension}`)
      ? `${storedName}.${extension}`
      : storedName;

    return clone({
      evidenceId: Number(evidence.nevidencias),
      storedName,
      downloadName,
    });
  },

  async submitDecision(role, accountId, requestId, payload) {
    const parsedRole = parseRole(role);
    if (!parsedRole) {
      const error = new Error('Invalid role.');
      error.statusCode = 400;
      throw error;
    }

    const actorUtilizadorId = await getUtilizadorIdByAccountId(accountId);
    if (!actorUtilizadorId) {
      const error = new Error('User not found for account.');
      error.statusCode = 404;
      throw error;
    }

    const row = await getRequestByIdForRole(parsedRole, actorUtilizadorId, requestId);
    if (!row) {
      const error = new Error('Request not found.');
      error.statusCode = 404;
      throw error;
    }

    const hasAccess = await ensureRoleAccessToRequest(parsedRole, actorUtilizadorId, row);
    if (!hasAccess) {
      const error = new Error('You are not allowed to review this request.');
      error.statusCode = 403;
      throw error;
    }

    await applyDecision({
      role: parsedRole,
      request: row,
      decision: payload?.decision,
      comment: payload?.comment,
    });
    await insertManagerOwnership(parsedRole, actorUtilizadorId, requestId);

    const updated = await getRequestByIdForRole(parsedRole, actorUtilizadorId, requestId);
    if (!updated) {
      return null;
    }

    const item = await mapRequestDetails(updated, parsedRole);
    return clone(item);
  },
};
