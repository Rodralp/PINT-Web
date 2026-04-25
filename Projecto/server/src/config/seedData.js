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
];

const defaultLevelNames = [
  'Nivel Junior',
  'Nivel Intermedio',
  'Nivel Senior',
  'Nivel Especialista',
  'Nivel Lider de Conhecimento',
];

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

const assignServiceLineToEachLeader = async (accounts, serviceLineIds, utilizadorByAccountId, transaction) => {
  const leaderAccounts = accounts.filter(isServiceLineLeader);

  if (leaderAccounts.length === 0 || serviceLineIds.length === 0) {
    return;
  }

  for (let index = 0; index < leaderAccounts.length; index += 1) {
    const account = leaderAccounts[index];
    const utilizadorId = utilizadorByAccountId.get(account.id);

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
    await assignServiceLineToEachLeader(accounts, serviceLineIds, utilizadorByAccountId, transaction);

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