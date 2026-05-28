import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SPECIAL_BADGE_TYPE_NAME = 'Especial';
const SPECIAL_BADGE_TYPE_KEY = 'special';

const badgeTypeMatchers = [
  { key: 'badge_level_junior', matchers: ['junior'] },
  { key: 'badge_level_intermediate', matchers: ['intermedio', 'interm'] },
  { key: 'badge_level_senior', matchers: ['senior'] },
  { key: 'badge_level_specialist', matchers: ['especialista'] },
  { key: 'badge_level_knowledge_lead', matchers: ['lider de conhecimento', 'lider'] },
];

const specialTriggerTypes = new Set(['badge_count', 'ranking_position', 'streak_days']);

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

const normalizeBadgeImage = (value) => {
  const normalized = String(value || '').trim();
  return normalized || null;
};

const normalizeSpecialRequirements = (requirements) => {
  if (!Array.isArray(requirements)) {
    return [];
  }

  const uniqueByType = new Map();

  for (const requirement of requirements) {
    const type = String(requirement?.type || '').trim();
    const value = Number(requirement?.value);

    if (!specialTriggerTypes.has(type) || !Number.isInteger(value) || value <= 0) {
      continue;
    }

    if (!uniqueByType.has(type)) {
      uniqueByType.set(type, { type, value });
    }
  }

  return Array.from(uniqueByType.values());
};

const normalizeStandardRequirements = (requirements) => {
  if (!Array.isArray(requirements)) {
    return [];
  }

  const normalized = [];

  for (const requirement of requirements) {
    const title = String(requirement?.title || requirement?.requisito || '').trim();
    const description = String(requirement?.description || requirement?.r_descricao || '').trim();
    const image = normalizeBadgeImage(requirement?.image || requirement?.imagem);

    if (!title || !description) {
      continue;
    }

    normalized.push({
      title: title.slice(0, 50),
      description: description.slice(0, 255),
      image,
    });
  }

  return normalized;
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

const getTypeNameById = async (typeId, transaction) => {
  const [row] = await sequelize.query(
    `
      SELECT tipo
      FROM tipo
      WHERE ntipo = :typeId
      LIMIT 1
    `,
    {
      replacements: { typeId: Number(typeId) },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  return row?.tipo || null;
};

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

const resolveBadgeTypeGroup = (value) => {
  const normalized = normalizeForCompare(value);
  if (!normalized) {
    return null;
  }

  return badgeTypeMatchers.find((group) =>
    normalizeForCompare(group.key) === normalized
    || group.matchers.some((matcher) => normalized.includes(matcher)),
  ) || null;
};

const resolveStandardBadgeTypeId = async ({ requestedTypeId, levelTitle, transaction }) => {
  const types = await getBadgeTypes(transaction);
  const standardTypes = (types || []).filter((type) =>
    normalizeForCompare(type.tipo) !== normalizeForCompare(SPECIAL_BADGE_TYPE_NAME),
  );

  if (standardTypes.length === 0) {
    return null;
  }

  const numericRequestedTypeId = parseId(requestedTypeId);
  if (numericRequestedTypeId) {
    const directMatch = standardTypes.find((type) => Number(type.ntipo) === numericRequestedTypeId);
    if (directMatch?.ntipo) {
      return Number(directMatch.ntipo);
    }
  }

  const requestedTypeGroup = resolveBadgeTypeGroup(requestedTypeId);
  if (requestedTypeGroup) {
    const typeByGroup = standardTypes.find((type) =>
      requestedTypeGroup.matchers.some((matcher) => normalizeForCompare(type.tipo).includes(matcher)),
    );

    if (typeByGroup?.ntipo) {
      return Number(typeByGroup.ntipo);
    }
  }

  const normalizedRequestedType = normalizeForCompare(requestedTypeId);
  if (normalizedRequestedType) {
    const directNameMatch = standardTypes.find((type) => {
      const normalizedTypeName = normalizeForCompare(type.tipo);
      return normalizedTypeName === normalizedRequestedType || normalizedTypeName.includes(normalizedRequestedType);
    });

    if (directNameMatch?.ntipo) {
      return Number(directNameMatch.ntipo);
    }
  }

  const levelTypeGroup = resolveBadgeTypeGroup(levelTitle);
  if (levelTypeGroup) {
    const typeByLevel = standardTypes.find((type) =>
      levelTypeGroup.matchers.some((matcher) => normalizeForCompare(type.tipo).includes(matcher)),
    );

    if (typeByLevel?.ntipo) {
      return Number(typeByLevel.ntipo);
    }
  }

  return Number(standardTypes[0].ntipo);
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

const replaceBadgeTriggers = async (badgeId, requirements, transaction) => {
  await sequelize.query(
    'DELETE FROM badge_trigger WHERE nbadge = :badgeId',
    {
      replacements: { badgeId: Number(badgeId) },
      type: QueryTypes.DELETE,
      transaction,
    },
  );

  const normalizedRequirements = normalizeSpecialRequirements(requirements);

  for (const requirement of normalizedRequirements) {
    await sequelize.query(
      `
        INSERT INTO badge_trigger (nbadge, trigger_tipo, trigger_valor)
        VALUES (:badgeId, :triggerType, :triggerValue)
      `,
      {
        replacements: {
          badgeId: Number(badgeId),
          triggerType: requirement.type,
          triggerValue: requirement.value,
        },
        type: QueryTypes.INSERT,
        transaction,
      },
    );
  }
};

const loadBadgeTriggers = async (badgeId, transaction) => {
  const rows = await sequelize.query(
    `
      SELECT trigger_tipo, trigger_valor
      FROM badge_trigger
      WHERE nbadge = :badgeId
      ORDER BY trigger_tipo ASC
    `,
    {
      replacements: { badgeId: Number(badgeId) },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  return (rows || []).map((row) => ({
    type: row.trigger_tipo,
    value: Number(row.trigger_valor),
  }));
};

const loadBadgeRequirements = async (badgeId, transaction) => {
  const rows = await sequelize.query(
    `
      SELECT nreq, requisito, r_descricao, imagem
      FROM requisitos
      WHERE nbadge = :badgeId
      ORDER BY nreq ASC
    `,
    {
      replacements: { badgeId: Number(badgeId) },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  return (rows || []).map((row) => ({
    id: `req-${Number(row.nreq)}`,
    title: row.requisito || 'Requisito',
    description: row.r_descricao || '',
    image: row.imagem || null,
  }));
};

const replaceBadgeRequirements = async (badgeId, requirements, transaction) => {
  await sequelize.query(
    'DELETE FROM requisitos WHERE nbadge = :badgeId',
    {
      replacements: { badgeId: Number(badgeId) },
      type: QueryTypes.DELETE,
      transaction,
    },
  );

  const normalizedRequirements = normalizeStandardRequirements(requirements);

  for (const requirement of normalizedRequirements) {
    await sequelize.query(
      `
        INSERT INTO requisitos (requisito, r_descricao, imagem, nbadge)
        VALUES (:title, :description, :image, :badgeId)
      `,
      {
        replacements: {
          title: requirement.title,
          description: requirement.description,
          image: requirement.image,
          badgeId: Number(badgeId),
        },
        type: QueryTypes.INSERT,
        transaction,
      },
    );
  }
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

const mapBadgeTypeMeta = (typeName) => {
  const normalizedTypeName = normalizeForCompare(typeName);

  if (normalizedTypeName === normalizeForCompare(SPECIAL_BADGE_TYPE_NAME)) {
    return {
      isSpecial: true,
      typeKey: SPECIAL_BADGE_TYPE_KEY,
    };
  }

  const matchedGroup = badgeTypeMatchers.find((group) =>
    group.matchers.some((matcher) => normalizedTypeName.includes(matcher)),
  );

  return {
    isSpecial: false,
    typeKey: matchedGroup?.key || null,
  };
};

const mapBadgeResponse = ({ badgeRow, levelContext, typeName, specialRequirements, requirements }) => {
  const typeMeta = mapBadgeTypeMeta(typeName);

  return {
    nbadge: Number(badgeRow.nbadge),
    b_nome: badgeRow.b_nome,
    b_descricao: badgeRow.b_descricao,
    pontos: Number(badgeRow.pontos) || 0,
    imagem: badgeRow.imagem || null,
    ntipo: Number(badgeRow.ntipo),
    typeName: typeName || null,
    typeKey: typeMeta.typeKey,
    levelId: levelContext?.levelId || null,
    levelTitle: levelContext?.levelTitle || null,
    isSpecial: typeMeta.isSpecial,
    specialRequirements: specialRequirements || [],
    requirements: requirements || [],
  };
};

const fetchBadgeLevelContextByBadgeId = async (badgeId, transaction) => {
  const [row] = await sequelize.query(
    `
      SELECT
        n.nnivel,
        n.nivel
      FROM nivel_contem_b AS ncb
      LEFT JOIN nivel AS n
        ON n.nnivel = ncb.nnivel
      WHERE ncb.nbadge = :badgeId
      ORDER BY n.nnivel ASC
      LIMIT 1
    `,
    {
      replacements: { badgeId: Number(badgeId) },
      type: QueryTypes.SELECT,
      transaction,
    },
  );

  if (!row?.nnivel) {
    return null;
  }

  return {
    levelId: Number(row.nnivel),
    levelTitle: row.nivel || null,
  };
};

export const adminBadgeModel = {
  async createBadge({ name, description, points, levelId, isSpecial, typeId, badgeImage, specialRequirements, requirements }) {
    return sequelize.transaction(async (transaction) => {
      const safePoints = Number.isFinite(Number(points)) ? Number(points) : 0;
      const parsedLevelId = parseId(levelId);
      const levelContext = isSpecial ? null : await getLevelContext(parsedLevelId, transaction);

      if (!isSpecial && !levelContext) {
        return null;
      }

      const resolvedTypeId = isSpecial
        ? await ensureSpecialBadgeTypeId(transaction)
        : await resolveStandardBadgeTypeId({
          requestedTypeId: typeId,
          levelTitle: levelContext?.levelTitle,
          transaction,
        });

      if (!resolvedTypeId) {
        return null;
      }

      const safeImage = normalizeBadgeImage(badgeImage);

      const [badgeRow] = await sequelize.query(
        `
          INSERT INTO badge (b_nome, b_descricao, pontos, imagem, ntipo)
          VALUES (:name, :description, :points, :image, :typeId)
          RETURNING nbadge, b_nome, b_descricao, pontos, imagem, ntipo
        `,
        {
          replacements: {
            name,
            description,
            points: safePoints,
            image: safeImage,
            typeId: resolvedTypeId,
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

      await replaceBadgeTriggers(badgeRow.nbadge, isSpecial ? specialRequirements : [], transaction);

      await replaceBadgeRequirements(badgeRow.nbadge, isSpecial ? [] : requirements, transaction);

      const [typeName, triggerRows, requirementRows] = await Promise.all([
        getTypeNameById(resolvedTypeId, transaction),
        loadBadgeTriggers(badgeRow.nbadge, transaction),
        loadBadgeRequirements(badgeRow.nbadge, transaction),
      ]);

      return mapBadgeResponse({
        badgeRow,
        levelContext,
        typeName,
        specialRequirements: triggerRows,
        requirements: requirementRows,
      });
    });
  },

  async updateBadge({ badgeId, name, description, points, levelId, isSpecial, typeId, badgeImage, specialRequirements, requirements }) {
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

      const resolvedTypeId = isSpecial
        ? await ensureSpecialBadgeTypeId(transaction)
        : await resolveStandardBadgeTypeId({
          requestedTypeId: typeId,
          levelTitle: levelContext?.levelTitle,
          transaction,
        });

      if (!resolvedTypeId) {
        return null;
      }

      const safeImage = normalizeBadgeImage(badgeImage);

      const [badgeRow] = await sequelize.query(
        `
          UPDATE badge
          SET b_nome = :name,
              b_descricao = :description,
              pontos = :points,
              imagem = :image,
              ntipo = :typeId
          WHERE nbadge = :badgeId
          RETURNING nbadge, b_nome, b_descricao, pontos, imagem, ntipo
        `,
        {
          replacements: {
            badgeId: parsedBadgeId,
            name,
            description,
            points: safePoints,
            image: safeImage,
            typeId: resolvedTypeId,
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

      await replaceBadgeTriggers(parsedBadgeId, isSpecial ? specialRequirements : [], transaction);

      await replaceBadgeRequirements(parsedBadgeId, isSpecial ? [] : requirements, transaction);

      const [typeName, triggerRows, requirementRows] = await Promise.all([
        getTypeNameById(resolvedTypeId, transaction),
        loadBadgeTriggers(parsedBadgeId, transaction),
        loadBadgeRequirements(parsedBadgeId, transaction),
      ]);

      return mapBadgeResponse({
        badgeRow,
        levelContext,
        typeName,
        specialRequirements: triggerRows,
        requirements: requirementRows,
      });
    });
  },

  async getBadge(badgeId) {
    const parsedBadgeId = parseId(badgeId);
    if (!parsedBadgeId) {
      return null;
    }

    const [row, specialRequirements, requirementRows] = await Promise.all([
      sequelize.query(
        `
          SELECT
            b.nbadge,
            b.b_nome,
            b.b_descricao,
            b.pontos,
            b.imagem,
            b.ntipo,
            t.tipo
          FROM badge AS b
          LEFT JOIN tipo AS t
            ON t.ntipo = b.ntipo
          WHERE b.nbadge = :badgeId
          LIMIT 1
        `,
        {
          replacements: { badgeId: parsedBadgeId },
          type: QueryTypes.SELECT,
        },
      ),
      loadBadgeTriggers(parsedBadgeId),
      loadBadgeRequirements(parsedBadgeId),
    ]);

    if (!row || row.length === 0) {
      return null;
    }

    const badgeRow = row[0];
    const levelContext = await fetchBadgeLevelContextByBadgeId(parsedBadgeId);

    return mapBadgeResponse({
      badgeRow,
      levelContext,
      typeName: badgeRow.tipo,
      specialRequirements,
      requirements: requirementRows,
    });
  },
};
