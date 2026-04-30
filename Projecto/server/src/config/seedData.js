import { Account } from '../models/sql/Account.js';
import { Reminder } from '../models/sql/Reminder.js';
import { QueryTypes } from 'sequelize';
import { sequelize } from './database.js';

const defaultAccounts = [
  {
    nome: 'Joao Gomes',
    email: 'joaogomes1234@softinsa.pt',
    senha: '12345678',
    role: 'consultor',
    status: 'ativo',
  },
  {
    nome: 'Maria Santos',
    email: 'maria.santos@softinsa.pt',
    senha: '12345678',
    role: 'talent-manager',
    status: 'ativo',
  },
  {
    nome: 'Pedro Mendes',
    email: 'pedro.mendes@softinsa.pt',
    senha: '12345678',
    role: 'service-line-leader',
    status: 'ativo',
  },
  {
    nome: 'Ana Costa',
    email: 'ana.costa@softinsa.pt',
    senha: '12345678',
    role: 'admin-gestor',
    status: 'ativo',
  },
];

const defaultReminders = [
  {
    title: 'Conferir requisitos enviados.',
    description: 'Rever todos os requisitos do novo projeto',
    date: '2025-12-07',
    color: 'green',
  },
  {
    title: 'Badge C++ Mastery expira em 30 dias.',
    description: 'Renovar certificacao antes do prazo',
    date: '2025-11-29',
    color: 'yellow',
  },
  {
    title: 'Meta de 15 badges ate ao fim do mes.',
    description: 'Completar badges restantes para atingir a meta',
    date: '2025-11-27',
    color: 'blue',
  },
  {
    title: 'Reuniao de equipa trimestral.',
    description: 'Preparar apresentacao dos resultados',
    date: '2026-01-15',
    color: 'purple',
  },
];

const defaultLearningPath = {
  name: 'Jornada Tecnica',
  description: 'Percurso tecnico base para Service Lines da plataforma.',
};

const defaultServiceLines = [
  {
    name: 'Hybrid Cloud',
    description: 'Foco em arquitetura cloud hibrida, operacao e escalabilidade.',
    areas: ['Cloud Architecture', 'Application Operations'],
  },
  {
    name: 'Data & AI',
    description: 'Foco em dados, analitica avancada e modelos de IA.',
    areas: ['Data Engineering', 'Machine Learning'],
  },
  {
    name: 'Cybersecurity',
    description: 'Foco em seguranca aplicacional, identidade e resposta a incidentes.',
    areas: ['Secure Development', 'Threat Detection'],
  },
  {
    name: 'Testing',
    description: 'Foco em testes manuais e automatizados, quality assurance e performance.',
    areas: ['Quality Assurance', 'Test Automation'],
  },
];

const defaultLevelNames = [
  'Nivel Junior',
  'Nivel Intermedio',
  'Nivel Senior',
  'Nivel Especialista',
  'Nivel Lider de Conhecimento',
];

const getLevelLabel = (rawLevelName) => {
  const raw = String(rawLevelName || '').trim();
  if (!raw.includes(' - ')) {
    return raw || 'Nivel';
  }

  return raw.split(' - ').slice(1).join(' - ').trim() || 'Nivel';
};

const buildSafeBadgeName = (areaName, rawLevelName) => {
  const MAX_BADGE_NAME_LENGTH = 25;
  const levelLabel = getLevelLabel(rawLevelName);
  const normalizedArea = String(areaName || 'Badge')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const candidate = `${normalizedArea} ${levelLabel}`.replace(/\s+/g, ' ').trim();
  if (candidate.length <= MAX_BADGE_NAME_LENGTH) {
    return candidate;
  }

  const initials = normalizedArea
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  const compactCandidate = `${initials} ${levelLabel}`.trim();

  if (compactCandidate.length <= MAX_BADGE_NAME_LENGTH) {
    return compactCandidate;
  }

  return candidate.slice(0, MAX_BADGE_NAME_LENGTH).trim();
};

const normalizeRoles = (rolesValue) => {
  const rawRoles = Array.isArray(rolesValue)
    ? rolesValue
    : typeof rolesValue === 'string'
      ? rolesValue.split(';')
      : [];

  return rawRoles
    .map((role) => String(role).trim().toLowerCase())
    .filter(Boolean);
};

const isServiceLineLeader = (account) => normalizeRoles(account.role).includes('service-line-leader');

const getOrCreateLearningPathId = async (transaction) => {
  const [existing] = await sequelize.query(
    `
      SELECT nlpath
      FROM learning_path
      WHERE LOWER(lpath) = LOWER(:name)
      LIMIT 1
    `,
    {
      replacements: { name: defaultLearningPath.name },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  if (existing?.nlpath) {
    return Number(existing.nlpath);
  }

  const [inserted] = await sequelize.query(
    `
      INSERT INTO learning_path (lpath, lp_desc)
      VALUES (:name, :description)
      RETURNING nlpath
    `,
    {
      replacements: {
        name: defaultLearningPath.name,
        description: defaultLearningPath.description,
      },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  return Number(inserted.nlpath);
};

const ensureServiceLinesAndAreas = async (learningPathId, transaction) => {
  const serviceLineIds = [];

  for (const serviceLine of defaultServiceLines) {
    const [existingServiceLine] = await sequelize.query(
      `
        SELECT nsline
        FROM service_line
        WHERE LOWER(sline) = LOWER(:name)
        LIMIT 1
      `,
      {
        replacements: { name: serviceLine.name },
        type: QueryTypes.SELECT,
        transaction,
      },
    );

    let serviceLineId = existingServiceLine?.nsline ? Number(existingServiceLine.nsline) : null;

    if (!serviceLineId) {
      const [insertedServiceLine] = await sequelize.query(
        `
          INSERT INTO service_line (sline, sl_desc, nlpath)
          VALUES (:name, :description, :learningPathId)
          RETURNING nsline
        `,
        {
          replacements: {
            name: serviceLine.name,
            description: serviceLine.description,
            learningPathId,
          },
          type: QueryTypes.SELECT,
          transaction,
        },
      );

      serviceLineId = Number(insertedServiceLine.nsline);
    }

    serviceLineIds.push(serviceLineId);

    for (const areaName of serviceLine.areas) {
      const [existingArea] = await sequelize.query(
        `
          SELECT narea
          FROM area
          WHERE nsline = :serviceLineId
            AND LOWER(area) = LOWER(:areaName)
          LIMIT 1
        `,
        {
          replacements: { serviceLineId, areaName },
          type: QueryTypes.SELECT,
          transaction,
        },
      );

      let areaId = existingArea?.narea ? Number(existingArea.narea) : null;

      if (!areaId) {
        const [insertedArea] = await sequelize.query(
          `
            INSERT INTO area (area, a_desc, nsline)
            VALUES (:areaName, :areaDescription, :serviceLineId)
            RETURNING narea
          `,
          {
            replacements: {
              areaName,
              areaDescription: `${areaName} - percurso de desenvolvimento`,
              serviceLineId,
            },
            type: QueryTypes.SELECT,
            transaction,
          },
        );

        areaId = Number(insertedArea.narea);
      }

      for (const levelName of defaultLevelNames) {
        const scopedLevelName = `${areaName} - ${levelName}`;

        await sequelize.query(
          `
            INSERT INTO nivel (nivel, narea)
            SELECT :scopedLevelName, :areaId
            WHERE NOT EXISTS (
              SELECT 1
              FROM nivel
              WHERE narea = :areaId
                AND LOWER(nivel) = LOWER(:scopedLevelName)
            )
          `,
          {
            replacements: { scopedLevelName, areaId },
            type: QueryTypes.INSERT,
            transaction,
          },
        );
      }
    }
  }

  return serviceLineIds;
};

const ensureUtilizadorForAccounts = async (accounts, transaction) => {
  const utilizadorByAccountId = new Map();

  for (const account of accounts) {
    const [existingUser] = await sequelize.query(
      `
        SELECT nutilizador
        FROM utilizador
        WHERE LOWER(email) = LOWER(:email)
        LIMIT 1
      `,
      {
        replacements: { email: account.email },
        type: QueryTypes.SELECT,
        transaction,
      },
    );

    if (existingUser?.nutilizador) {
      utilizadorByAccountId.set(account.id, Number(existingUser.nutilizador));
      continue;
    }

    const [insertedUser] = await sequelize.query(
      `
        INSERT INTO utilizador (nome, email, data_registo, permissoes)
        VALUES (:nome, :email, CURRENT_DATE, :permissoes)
        RETURNING nutilizador
      `,
      {
        replacements: {
          nome: account.nome,
          email: account.email,
          permissoes: account.role,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    );

    utilizadorByAccountId.set(account.id, Number(insertedUser.nutilizador));
  }

  return utilizadorByAccountId;
};

const assignServiceLineToEachLeader = async (accounts, serviceLineIds, transaction) => {
  const leaderAccounts = accounts.filter(isServiceLineLeader);
  const globalAccessUserIds = new Set([5]);

  if (leaderAccounts.length === 0 || serviceLineIds.length === 0) {
    return;
  }

  for (let index = 0; index < leaderAccounts.length; index += 1) {
    const account = leaderAccounts[index];
    const utilizadorId = account.id;

    if (!utilizadorId) {
      continue;
    }

    const serviceLineId = serviceLineIds[index % serviceLineIds.length];

    await sequelize.query(
      'DELETE FROM sll_leader_sl WHERE nutilizador = :utilizadorId',
      {
        replacements: { utilizadorId },
        type: QueryTypes.DELETE,
        transaction,
      },
    );

    if (globalAccessUserIds.has(Number(utilizadorId))) {
      for (const currentServiceLineId of serviceLineIds) {
        await sequelize.query(
          `
            INSERT INTO sll_leader_sl (nutilizador, nsline)
            VALUES (:utilizadorId, :serviceLineId)
          `,
          {
            replacements: { utilizadorId, serviceLineId: currentServiceLineId },
            type: QueryTypes.INSERT,
            transaction,
          },
        );
      }
      continue;
    }

    await sequelize.query(
      `
        INSERT INTO sll_leader_sl (nutilizador, nsline)
        VALUES (:utilizadorId, :serviceLineId)
      `,
      {
        replacements: { utilizadorId, serviceLineId },
        type: QueryTypes.INSERT,
        transaction,
      },
    );
  }
};

const ensureDefaultBadgeType = async (transaction) => {
  const defaultTypeName = 'Tecnico';

  const [existingType] = await sequelize.query(
    `
      SELECT ntipo
      FROM tipo
      WHERE LOWER(tipo) = LOWER(:defaultTypeName)
      LIMIT 1
    `,
    {
      replacements: { defaultTypeName },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  if (existingType?.ntipo) {
    return Number(existingType.ntipo);
  }

  const [insertedType] = await sequelize.query(
    `
      INSERT INTO tipo (tipo)
      VALUES (:defaultTypeName)
      RETURNING ntipo
    `,
    {
      replacements: { defaultTypeName },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  return Number(insertedType.ntipo);
};

const ensureEstadosAndMockData = async (accounts, transaction) => {
  const estados = ['aprovado', 'candidatura_em_progresso', 'em_validacao', 'evidencias_insuficientes'];
  const estadoIds = {};
  const defaultBadgeTypeId = await ensureDefaultBadgeType(transaction);
  
  for (const st of estados) {
    const [existing] = await sequelize.query(
      `SELECT nestado FROM estado WHERE estado = :st LIMIT 1`,
      { replacements: { st }, type: QueryTypes.SELECT, transaction }
    );
    if (!existing) {
      const [inserted] = await sequelize.query(
        `INSERT INTO estado (estado) VALUES (:st) RETURNING nestado`,
        { replacements: { st }, type: QueryTypes.SELECT, transaction }
      );
      estadoIds[st] = Number(inserted.nestado);
    } else {
      estadoIds[st] = Number(existing.nestado);
    }
  }

  const niveis = await sequelize.query(`
    SELECT n.nnivel, n.nivel, a.area, sl.sline, lp.nlpath, sl.nsline, a.narea
    FROM nivel n
    JOIN area a ON a.narea = n.narea
    JOIN service_line sl ON sl.nsline = a.nsline
    JOIN learning_path lp ON lp.nlpath = sl.nlpath
    ORDER BY n.nnivel ASC
  `, { type: QueryTypes.SELECT, transaction });

  const badgesByNivel = {};

  for (const n of niveis) {
    const [existingCb] = await sequelize.query(`
      SELECT nbadge FROM nivel_contem_b WHERE nnivel = :nnivel LIMIT 1
    `, { replacements: { nnivel: n.nnivel }, type: QueryTypes.SELECT, transaction });

    let nbadge = null;
    if (!existingCb) {
      const b_nome = buildSafeBadgeName(n.area, n.nivel);
      const b_descricao = `${n.area} - ${getLevelLabel(n.nivel)}`;
      const [insertedB] = await sequelize.query(`
          INSERT INTO badge (b_nome, b_descricao, ntipo) VALUES (:b_nome, :b_descricao, :ntipo) RETURNING nbadge
        `, { replacements: { b_nome, b_descricao, ntipo: defaultBadgeTypeId }, type: QueryTypes.SELECT, transaction });
      nbadge = Number(insertedB.nbadge);

      await sequelize.query(`INSERT INTO nivel_contem_b (nnivel, nbadge) VALUES (:nnivel, :nbadge)`,
        { replacements: { nnivel: n.nnivel, nbadge }, type: QueryTypes.INSERT, transaction });
      
      await sequelize.query(`INSERT INTO b_pertence_a (narea, nbadge) VALUES (:narea, :nbadge)`, { replacements: { narea: n.narea, nbadge }, type: QueryTypes.INSERT, transaction });
      await sequelize.query(`INSERT INTO b_pertence_sl (nsline, nbadge) VALUES (:nsline, :nbadge)`, { replacements: { nsline: n.nsline, nbadge }, type: QueryTypes.INSERT, transaction });
      await sequelize.query(`INSERT INTO b_pertence_lp (nlpath, nbadge) VALUES (:nlpath, :nbadge)`, { replacements: { nlpath: n.nlpath, nbadge }, type: QueryTypes.INSERT, transaction });
    } else {
      nbadge = Number(existingCb.nbadge);
    }
    badgesByNivel[n.nnivel] = nbadge;
  }

  const consultorAccounts = accounts.filter((account) =>
    normalizeRoles(account.role).includes('consultor'),
  );

  const untouchedServiceLine = 'Testing';

  for (const account of consultorAccounts) {
    const utilizadorId = account.id;
    if (!utilizadorId) {
      continue;
    }

    for (const n of niveis) {
      if (n.sline === untouchedServiceLine) {
        continue;
      }

      const nbadge = badgesByNivel[n.nnivel];
      if (!nbadge) {
        continue;
      }

      const [hasCb] = await sequelize.query(
        `
          SELECT 1
          FROM c_obtem_b
          WHERE nutilizador = :utilizadorId
            AND nbadge = :nbadge
          LIMIT 1
        `,
        {
          replacements: { utilizadorId, nbadge },
          type: QueryTypes.SELECT,
          transaction,
        },
      );
      const [hasPed] = await sequelize.query(
        `
          SELECT 1
          FROM pedidos
          WHERE nutilizador = :utilizadorId
            AND nbadge = :nbadge
          LIMIT 1
        `,
        {
          replacements: { utilizadorId, nbadge },
          type: QueryTypes.SELECT,
          transaction,
        },
      );

      if (hasCb || hasPed) {
        continue;
      }

      const seed = (Number(utilizadorId) + Number(n.nnivel)) % 7;
      if (seed === 0 || seed === 4) {
        continue;
      }

      if (seed === 1) {
        await sequelize.query(
          `
            INSERT INTO c_obtem_b (nutilizador, nbadge, pontos_obtidos)
            VALUES (:utilizadorId, :nbadge, 100)
          `,
          {
            replacements: { utilizadorId, nbadge },
            type: QueryTypes.INSERT,
            transaction,
          },
        );
        continue;
      }

      const estadoId = seed === 2
        ? estadoIds.em_validacao
        : seed === 3
          ? estadoIds.evidencias_insuficientes
          : seed === 6
            ? estadoIds.aprovado
            : estadoIds.candidatura_em_progresso;

      await sequelize.query(
        `
          INSERT INTO pedidos (nutilizador, nbadge, estado, data_submissao)
          VALUES (:utilizadorId, :nbadge, :estadoId, CURRENT_DATE)
        `,
        {
          replacements: { utilizadorId, nbadge, estadoId },
          type: QueryTypes.INSERT,
          transaction,
        },
      );
    }
  }
};

const seedServiceLineData = async () => {
  const transaction = await sequelize.transaction();

  try {
    const accounts = await Account.findAll({
      attributes: ['id', 'nome', 'email', 'role'],
      order: [['id', 'ASC']],
      transaction,
    });

    if (accounts.length === 0) {
      await transaction.commit();
      return;
    }

    const utilizadorByAccountId = await ensureUtilizadorForAccounts(accounts, transaction);
    const learningPathId = await getOrCreateLearningPathId(transaction);
    const serviceLineIds = await ensureServiceLinesAndAreas(learningPathId, transaction);
    await assignServiceLineToEachLeader(accounts, serviceLineIds, transaction);
    
    await ensureEstadosAndMockData(accounts, transaction);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const seedDatabase = async () => {
  const [accountsCount, remindersCount] = await Promise.all([Account.count(), Reminder.count()]);

  if (accountsCount === 0) {
    await Account.bulkCreate(defaultAccounts);
  }

  const orderedAccounts = await Account.findAll({ order: [['id', 'ASC']] });
  const defaultConsultorAccount = orderedAccounts.find((account) =>
    String(account.role || '')
      .split(';')
      .map((role) => role.trim().toLowerCase())
      .includes('consultor')
  ) || orderedAccounts[0] || null;

  if (defaultConsultorAccount) {
    await Reminder.update(
      { accountId: defaultConsultorAccount.id },
      { where: { accountId: null } },
    );
  }

  if (remindersCount === 0 && defaultConsultorAccount) {
    await Reminder.bulkCreate(
      defaultReminders.map((reminder) => ({
        ...reminder,
        accountId: defaultConsultorAccount.id,
      })),
    );
  }

  await seedServiceLineData();
};
