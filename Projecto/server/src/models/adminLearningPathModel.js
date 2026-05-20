import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const buildLearningPathTree = (rows) => {
  const learningPathMap = new Map();
  const serviceLineMap = new Map();
  const areaMap = new Map();

  rows.forEach((row) => {
    const pathId = Number(row?.nlpath);
    if (!Number.isInteger(pathId) || pathId <= 0) {
      return;
    }

    const pathKey = `learning-path-${pathId}`;

    if (!learningPathMap.has(pathKey)) {
      learningPathMap.set(pathKey, {
        id: pathKey,
        name: row.lpath,
        description: row.lp_desc,
        serviceLines: [],
      });
    }

    const learningPath = learningPathMap.get(pathKey);
    const serviceLineId = Number(row?.nsline);

    if (!Number.isInteger(serviceLineId) || serviceLineId <= 0) {
      return;
    }

    const serviceLineKey = `service-line-${serviceLineId}`;
    const serviceLineMapKey = `${pathKey}:${serviceLineKey}`;
    let serviceLine = serviceLineMap.get(serviceLineMapKey);

    if (!serviceLine) {
      serviceLine = {
        id: serviceLineKey,
        name: row.sline,
        description: row.sl_desc,
        image: '/LP_BG.png',
        areas: [],
      };

      learningPath.serviceLines.push(serviceLine);
      serviceLineMap.set(serviceLineMapKey, serviceLine);
    }

    const areaId = Number(row?.narea);
    if (!Number.isInteger(areaId) || areaId <= 0) {
      return;
    }

    const areaKey = `area-${areaId}`;
    const areaMapKey = `${serviceLineMapKey}:${areaKey}`;
    let area = areaMap.get(areaMapKey);

    if (!area) {
      area = {
        id: areaKey,
        name: row.area,
        description: row.a_desc,
        levels: [],
      };

      serviceLine.areas.push(area);
      areaMap.set(areaMapKey, area);
    }

    const levelId = Number(row?.nnivel);
    if (!Number.isInteger(levelId) || levelId <= 0) {
      return;
    }

    const title = String(row?.nivel || '').trim();
    area.levels.push({
      id: `nivel-${levelId}`,
      title,
      subtitle: `Nivel ${area.levels.length + 1}`,
    });
  });

  return Array.from(learningPathMap.values());
};

const recordExists = async (query, id) => {
  const [row] = await sequelize.query(query, {
    replacements: { id: Number(id) },
    type: QueryTypes.SELECT,
  });
  return Boolean(row);
};

export const adminLearningPathModel = {
  async listLearningPaths() {
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
          n.nivel
        FROM learning_path AS lp
        LEFT JOIN service_line AS sl
          ON sl.nlpath = lp.nlpath
        LEFT JOIN area AS a
          ON a.nsline = sl.nsline
        LEFT JOIN nivel AS n
          ON n.narea = a.narea
        ORDER BY lp.nlpath ASC, sl.nsline ASC, a.narea ASC, n.nnivel ASC
      `,
      { type: QueryTypes.SELECT },
    );

    return buildLearningPathTree(rows || []);
  },

  async createLearningPath({ name, description }) {
    const [row] = await sequelize.query(
      `
        INSERT INTO learning_path (lpath, lp_desc)
        VALUES (:name, :description)
        RETURNING nlpath, lpath, lp_desc
      `,
      {
        replacements: { name, description },
        type: QueryTypes.SELECT,
      },
    );

    return row || null;
  },

  async updateLearningPath({ learningPathId, name, description }) {
    const [row] = await sequelize.query(
      `
        UPDATE learning_path
        SET lpath = :name,
            lp_desc = :description
        WHERE nlpath = :learningPathId
        RETURNING nlpath, lpath, lp_desc
      `,
      {
        replacements: { learningPathId, name, description },
        type: QueryTypes.SELECT,
      },
    );

    return row || null;
  },

  async createServiceLine({ learningPathId, name, description }) {
    const [row] = await sequelize.query(
      `
        INSERT INTO service_line (sline, sl_desc, nlpath)
        VALUES (:name, :description, :learningPathId)
        RETURNING nsline, sline, sl_desc, nlpath
      `,
      {
        replacements: { name, description, learningPathId },
        type: QueryTypes.SELECT,
      },
    );

    return row || null;
  },

  async updateServiceLine({ serviceLineId, name, description }) {
    const [row] = await sequelize.query(
      `
        UPDATE service_line
        SET sline = :name,
            sl_desc = :description
        WHERE nsline = :serviceLineId
        RETURNING nsline, sline, sl_desc, nlpath
      `,
      {
        replacements: { serviceLineId, name, description },
        type: QueryTypes.SELECT,
      },
    );

    return row || null;
  },

  async createArea({ serviceLineId, name, description }) {
    const [row] = await sequelize.query(
      `
        INSERT INTO area (area, a_desc, nsline)
        VALUES (:name, :description, :serviceLineId)
        RETURNING narea, area, a_desc, nsline
      `,
      {
        replacements: { name, description, serviceLineId },
        type: QueryTypes.SELECT,
      },
    );

    return row || null;
  },

  async updateArea({ areaId, name, description }) {
    const [row] = await sequelize.query(
      `
        UPDATE area
        SET area = :name,
            a_desc = :description
        WHERE narea = :areaId
        RETURNING narea, area, a_desc, nsline
      `,
      {
        replacements: { areaId, name, description },
        type: QueryTypes.SELECT,
      },
    );

    return row || null;
  },

  async createLevel({ areaId, title }) {
    const [row] = await sequelize.query(
      `
        INSERT INTO nivel (nivel, narea)
        VALUES (:title, :areaId)
        RETURNING nnivel, nivel, narea
      `,
      {
        replacements: { title, areaId },
        type: QueryTypes.SELECT,
      },
    );

    return row || null;
  },

  async updateLevel({ levelId, title }) {
    const [row] = await sequelize.query(
      `
        UPDATE nivel
        SET nivel = :title
        WHERE nnivel = :levelId
        RETURNING nnivel, nivel, narea
      `,
      {
        replacements: { levelId, title },
        type: QueryTypes.SELECT,
      },
    );

    return row || null;
  },

  async hasLearningPath(learningPathId) {
    return recordExists(
      'SELECT 1 FROM learning_path WHERE nlpath = :id LIMIT 1',
      learningPathId,
    );
  },

  async hasServiceLine(serviceLineId) {
    return recordExists(
      'SELECT 1 FROM service_line WHERE nsline = :id LIMIT 1',
      serviceLineId,
    );
  },

  async hasArea(areaId) {
    return recordExists('SELECT 1 FROM area WHERE narea = :id LIMIT 1', areaId);
  },
};
