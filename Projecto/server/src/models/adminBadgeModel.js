import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SPECIAL_BADGE_TYPE_NAME = 'Especial';

const badgeTypeMatchers = [
  { id: 'junior', matchers: ['junior'] },
  { id: 'intermedio', matchers: ['intermedio', 'interm'] },
  { id: 'senior', matchers: ['senior'] },
  { id: 'especialista', matchers: ['especialista'] },
  { id: 'lider', matchers: ['lider'] },
];

const normalizeForCompare = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const parseId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getBadgeTypes = async (transaction) => sequelize.query(
  `
    SELECT ntipo, tipo
    FROM tipo
    ORDER BY ntipo ASC
  `,
  {
    type: QueryTypes.SELECT,
    transaction,
  },
);

const ensureSpecialBadgeTypeId = async (transaction) => {
  const [existing] = await sequelize.query(
    `
      SELECT ntipo
      FROM tipo
      WHERE LOWER(tipo) = LOWER(:typeName)
      LIMIT 1
    `,
    {
      replacements: { typeName: SPECIAL_BADGE_TYPE_NAME },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  if (existing?.ntipo) {
    return Number(existing.ntipo);
  }

  const [inserted] = await sequelize.query(
    `
      INSERT INTO tipo (tipo)
      VALUES (:typeName)
      RETURNING ntipo
    `,
    {
      replacements: { typeName: SPECIAL_BADGE_TYPE_NAME },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  return inserted?.ntipo ? Number(inserted.ntipo) : null;
};

const resolveTypeIdFromLevelTitle = async (levelTitle, transaction) => {
  const types = await getBadgeTypes(transaction);
  if (!types || types.length === 0) {
    return null;
  }

  const normalizedLevel = normalizeForCompare(levelTitle);
  const matchedGroup = badgeTypeMatchers.find((group) =>
    group.matchers.some((matcher) => normalizedLevel.includes(matcher)),
  );

  if (matchedGroup) {
    const matchedType = types.find((type) =>
      matchedGroup.matchers.some((matcher) => normalizeForCompare(type.tipo).includes(matcher)),
    );

    if (matchedType?.ntipo) {
      return Number(matchedType.ntipo);
    }
  }

  return Number(types[0].ntipo);
};

const getLevelContext = async (levelId, transaction) => {
  const [row] = await sequelize.query(
    `
      SELECT
        n.nnivel,
        n.nivel,
        a.narea,
        sl.nsline,
        sl.nlpath
      FROM nivel AS n
      LEFT JOIN area AS a
        ON a.narea = n.narea
      LEFT JOIN service_line AS sl
        ON sl.nsline = a.nsline
      WHERE n.nnivel = :levelId
      LIMIT 1
    `,
    {
      replacements: { levelId: Number(levelId) },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  if (!row?.nnivel) {
    return null;
  }

  return {
    levelId: Number(row.nnivel),
    levelTitle: row.nivel,
    areaId: row.narea ? Number(row.narea) : null,
    serviceLineId: row.nsline ? Number(row.nsline) : null,
    learningPathId: row.nlpath ? Number(row.nlpath) : null,
  };
};

const clearBadgeAssociations = async (badgeId, transaction) => {
  await sequelize.query(
    'DELETE FROM nivel_contem_b WHERE nbadge = :badgeId',
    {
      replacements: { badgeId: Number(badgeId) },
      type: QueryTypes.DELETE,
      transaction,
    },
  );

  await sequelize.query(
    'DELETE FROM b_pertence_a WHERE nbadge = :badgeId',
    {
      replacements: { badgeId: Number(badgeId) },
      type: QueryTypes.DELETE,
      transaction,
    },
  );

  await sequelize.query(
    'DELETE FROM b_pertence_sl WHERE nbadge = :badgeId',
    {
      replacements: { badgeId: Number(badgeId) },
      type: QueryTypes.DELETE,
      transaction,
    },
  );

  await sequelize.query(
    'DELETE FROM b_pertence_lp WHERE nbadge = :badgeId',
    {
      replacements: { badgeId: Number(badgeId) },
      type: QueryTypes.DELETE,
      transaction,
    },
  );
};

const createBadgeAssociations = async (badgeId, levelContext, transaction) => {
  if (!levelContext) {
    return;
  }

  await sequelize.query(
    `
      INSERT INTO nivel_contem_b (nnivel, nbadge)
      VALUES (:levelId, :badgeId)
      ON CONFLICT DO NOTHING
    `,
    {
      replacements: {
        levelId: levelContext.levelId,
        badgeId: Number(badgeId),
      },
      type: QueryTypes.INSERT,
      transaction,
    },
  );

  if (levelContext.areaId) {
    await sequelize.query(
      `
        INSERT INTO b_pertence_a (narea, nbadge)
        VALUES (:areaId, :badgeId)
        ON CONFLICT DO NOTHING
      `,
      {
        replacements: {
          areaId: levelContext.areaId,
          badgeId: Number(badgeId),
        },
        type: QueryTypes.INSERT,
        transaction,
      },
    );
  }

  if (levelContext.serviceLineId) {
    await sequelize.query(
      `
        INSERT INTO b_pertence_sl (nsline, nbadge)
        VALUES (:serviceLineId, :badgeId)
        ON CONFLICT DO NOTHING
      `,
      {
        replacements: {
          serviceLineId: levelContext.serviceLineId,
          badgeId: Number(badgeId),
        },
        type: QueryTypes.INSERT,
        transaction,
      },
    );
  }

  if (levelContext.learningPathId) {
    await sequelize.query(
      `
        INSERT INTO b_pertence_lp (nlpath, nbadge)
        VALUES (:learningPathId, :badgeId)
        ON CONFLICT DO NOTHING
      `,
      {
        replacements: {
          learningPathId: levelContext.learningPathId,
          badgeId: Number(badgeId),
        },
        type: QueryTypes.INSERT,
        transaction,
      },
    );
  }
};

const mapBadgeResponse = (badgeRow, levelContext, typeName, isSpecial) => ({
  nbadge: Number(badgeRow.nbadge),
  b_nome: badgeRow.b_nome,
  b_descricao: badgeRow.b_descricao,
  pontos: Number(badgeRow.pontos) || 0,
  ntipo: Number(badgeRow.ntipo),
  typeName,
  levelId: levelContext?.levelId || null,
  levelTitle: levelContext?.levelTitle || null,
  isSpecial,
});

export const adminBadgeModel = {
  async createBadge({ name, description, points, levelId, isSpecial }) {
    return sequelize.transaction(async (transaction) => {
      const safePoints = Number.isFinite(Number(points)) ? Number(points) : 0;
      const parsedLevelId = parseId(levelId);
      const levelContext = isSpecial ? null : await getLevelContext(parsedLevelId, transaction);

      if (!isSpecial && !levelContext) {
        return null;
      }

      const typeId = isSpecial
        ? await ensureSpecialBadgeTypeId(transaction)
        : await resolveTypeIdFromLevelTitle(levelContext.levelTitle, transaction);

      if (!typeId) {
        return null;
      }

      const [badgeRow] = await sequelize.query(
        `
          INSERT INTO badge (b_nome, b_descricao, pontos, ntipo)
          VALUES (:name, :description, :points, :typeId)
          RETURNING nbadge, b_nome, b_descricao, pontos, ntipo
        `,
        {
          replacements: {
            name,
            description,
            points: safePoints,
            typeId,
          },
          type: QueryTypes.SELECT,
          transaction,
        },
      );

      if (!badgeRow?.nbadge) {
        return null;
      }

      if (!isSpecial) {
        await createBadgeAssociations(badgeRow.nbadge, levelContext, transaction);
      }

      return mapBadgeResponse(badgeRow, levelContext, null, isSpecial);
    });
  },

  async updateBadge({ badgeId, name, description, points, levelId, isSpecial }) {
    return sequelize.transaction(async (transaction) => {
      const parsedBadgeId = parseId(badgeId);
      if (!parsedBadgeId) {
        return null;
      }

      const safePoints = Number.isFinite(Number(points)) ? Number(points) : 0;
      const parsedLevelId = parseId(levelId);
      const levelContext = isSpecial ? null : await getLevelContext(parsedLevelId, transaction);

      if (!isSpecial && !levelContext) {
        return null;
      }

      const typeId = isSpecial
        ? await ensureSpecialBadgeTypeId(transaction)
        : await resolveTypeIdFromLevelTitle(levelContext.levelTitle, transaction);

      if (!typeId) {
        return null;
      }

      const [badgeRow] = await sequelize.query(
        `
          UPDATE badge
          SET b_nome = :name,
              b_descricao = :description,
              pontos = :points,
              ntipo = :typeId
          WHERE nbadge = :badgeId
          RETURNING nbadge, b_nome, b_descricao, pontos, ntipo
        `,
        {
          replacements: {
            badgeId: parsedBadgeId,
            name,
            description,
            points: safePoints,
            typeId,
          },
          type: QueryTypes.SELECT,
          transaction,
        },
      );

      if (!badgeRow?.nbadge) {
        return null;
      }

      await clearBadgeAssociations(parsedBadgeId, transaction);
      if (!isSpecial) {
        await createBadgeAssociations(parsedBadgeId, levelContext, transaction);
      }

      return mapBadgeResponse(badgeRow, levelContext, null, isSpecial);
    });
  },

  async getBadge(badgeId) {
    const parsedBadgeId = parseId(badgeId);
    if (!parsedBadgeId) {
      return null;
    }

    const rows = await sequelize.query(
      `
        SELECT
          b.nbadge,
          b.b_nome,
          b.b_descricao,
          b.pontos,
          b.ntipo,
          t.tipo,
          n.nnivel,
          n.nivel
        FROM badge AS b
        LEFT JOIN tipo AS t
          ON t.ntipo = b.ntipo
        LEFT JOIN nivel_contem_b AS ncb
          ON ncb.nbadge = b.nbadge
        LEFT JOIN nivel AS n
          ON n.nnivel = ncb.nnivel
        WHERE b.nbadge = :badgeId
        ORDER BY n.nnivel ASC
      `,
      {
        replacements: { badgeId: parsedBadgeId },
        type: QueryTypes.SELECT,
      },
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0];
    const normalizedType = normalizeForCompare(row.tipo);
    const isSpecial = normalizedType === normalizeForCompare(SPECIAL_BADGE_TYPE_NAME);

    return {
      nbadge: Number(row.nbadge),
      b_nome: row.b_nome,
      b_descricao: row.b_descricao,
      pontos: Number(row.pontos) || 0,
      ntipo: Number(row.ntipo),
      typeName: row.tipo,
      levelId: row.nnivel ? Number(row.nnivel) : null,
      levelTitle: row.nivel || null,
      isSpecial,
    };
  },
};
