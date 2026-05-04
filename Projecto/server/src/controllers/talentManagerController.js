import { sequelize } from '../config/database.js';
import { QueryTypes } from 'sequelize';

const parsePositiveId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// Histórico - Todas as Service Lines
export const getHistoricoServiceLines = async (req, res) => {
  const accountId = parsePositiveId(req.query?.accountId);

  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const rows = await sequelize.query(
      `
        SELECT
          sl.nsline AS id,
          sl.sline AS name,
          COALESCE(slCounts.total_badges, 0) AS totalBadges,
          COALESCE(slCounts.obtidas, 0) AS obtidas,
          COALESCE(slCounts.em_progresso, 0) AS emProgresso,
          COALESCE(slCounts.total_consultores, 0) AS totalConsultores
        FROM service_line sl
        LEFT JOIN (
          SELECT
            bps.nsline,
            COUNT(DISTINCT b.nbadge) AS total_badges,
            COUNT(DISTINCT CASE WHEN cb.nbadge IS NOT NULL THEN cb.nbadge END) AS obtidas,
            COUNT(DISTINCT CASE WHEN p.npedido IS NOT NULL AND p.estado IN (2, 3) THEN p.nbadge END) AS em_progresso,
            COUNT(DISTINCT u.nutilizador) AS total_consultores
          FROM b_pertence_sl bps
          JOIN badge b ON b.nbadge = bps.nbadge
          LEFT JOIN c_obtem_b cb ON cb.nbadge = b.nbadge
          LEFT JOIN pedidos p ON p.nbadge = b.nbadge AND p.estado IN (2, 3)
          LEFT JOIN utilizador u ON (
            cb.nutilizador = u.nutilizador OR
            p.nutilizador = u.nutilizador
          ) AND LOWER(u.permissoes) LIKE '%consultor%'
          GROUP BY bps.nsline
        ) slCounts ON slCounts.nsline = sl.nsline
        ORDER BY sl.sline ASC
      `,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to fetch service lines.' });
  }
};

// Histórico - Todos os Badges
export const getHistoricoBadges = async (req, res) => {
  const accountId = parsePositiveId(req.query?.accountId);

  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const rows = await sequelize.query(
      `
        SELECT
          b.nbadge AS id,
          b.b_nome AS name,
          a.area,
          sl.sline AS serviceLine,
          n.nivel AS level,
          COALESCE(bCounts.consultores_obtidos, 0) AS consultoresObtidos,
          COALESCE(bCounts.em_progresso, 0) AS emProgresso,
          CASE
            WHEN COALESCE(bCounts.consultores_obtidos, 0) > 0 THEN 'completo'
            WHEN COALESCE(bCounts.em_progresso, 0) > 0 THEN 'a-fazer'
            ELSE 'a-fazer'
          END AS status
        FROM badge b
        LEFT JOIN area a ON a.narea = b.narea
        LEFT JOIN b_pertence_sl bps ON bps.nbadge = b.nbadge
        LEFT JOIN service_line sl ON sl.nsline = bps.nsline
        LEFT JOIN nivel n ON n.nnivel = b.nnivel
        LEFT JOIN (
          SELECT
            b.nbadge,
            COUNT(DISTINCT CASE WHEN cb.nutilizador IS NOT NULL THEN cb.nutilizador END) AS consultores_obtidos,
            COUNT(DISTINCT CASE WHEN p.npedido IS NOT NULL AND p.estado IN (2, 3) THEN p.nutilizador END) AS em_progresso
          FROM badge b
          LEFT JOIN c_obtem_b cb ON cb.nbadge = b.nbadge
          LEFT JOIN pedidos p ON p.nbadge = b.nbadge AND p.estado IN (2, 3)
          GROUP BY b.nbadge
        ) bCounts ON bCounts.nbadge = b.nbadge
        ORDER BY b.b_nome ASC
      `,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to fetch badges.' });
  }
};

// Histórico - Todos os Consultores (sem coluna service line)
export const getHistoricoConsultores = async (req, res) => {
  const accountId = parsePositiveId(req.query?.accountId);

  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const rows = await sequelize.query(
      `
        SELECT
          u.nutilizador AS id,
          u.nome AS name,
          u.email,
          'https://i.pravatar.cc/120?u=' || COALESCE(NULLIF(REPLACE(LOWER(u.email), '@', '.'), ''), LOWER(REPLACE(u.nome, ' ', '.'))) AS avatar,
          COALESCE(bs.points, 0) AS points,
          COALESCE(bs.badges, 0) AS badgesObtidas,
          COALESCE(cCounts.em_progresso, 0) AS badgesEmProgresso,
          u.status
        FROM utilizador u
        LEFT JOIN (
          SELECT
            cb.nutilizador,
            SUM(COALESCE(NULLIF(cb.pontos_obtidos, 0), NULLIF(b.pontos, 0), 0)) AS points,
            COUNT(DISTINCT cb.nbadge) AS badges
          FROM c_obtem_b cb
          JOIN badge b ON b.nbadge = cb.nbadge
          GROUP BY cb.nutilizador
        ) bs ON bs.nutilizador = u.nutilizador
        LEFT JOIN (
          SELECT
            p.nutilizador,
            COUNT(DISTINCT p.nbadge) AS em_progresso
          FROM pedidos p
          WHERE p.estado IN (2, 3)
          GROUP BY p.nutilizador
        ) cCounts ON cCounts.nutilizador = u.nutilizador
        WHERE LOWER(u.permissoes) LIKE '%consultor%'
        ORDER BY u.nome ASC
      `,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to fetch consultores.' });
  }
};

// Detalhes - Histórico de badges de um consultor específico
export const getDetalhesConsultorTM = async (req, res) => {
  const consultorId = parsePositiveId(req.query?.consultorId);

  if (!consultorId) {
    res.status(400).json({ message: 'Consultor id is required.' });
    return;
  }

  try {
    // Buscar detalhes do consultor
    const [consultor] = await sequelize.query(
      `
        SELECT
          u.nutilizador AS id,
          u.nome AS name,
          u.email,
          COALESCE(SUM(cb.pontos_obtidos), 0) AS totalPoints
        FROM utilizador u
        LEFT JOIN c_obtem_b cb ON cb.nutilizador = u.nutilizador
        WHERE u.nutilizador = :consultorId
        GROUP BY u.nutilizador, u.nome, u.email
      `,
      { replacements: { consultorId }, type: QueryTypes.SELECT }
    );

    if (!consultor) {
      res.status(404).json({ message: 'Consultor not found.' });
      return;
    }

    // Buscar badges obtidos pelo consultor
    const badgesObtidos = await sequelize.query(
      `
        SELECT
          b.nbadge AS id,
          b.b_nome AS name,
          a.area AS areaName,
          sl.sline AS serviceLineName,
          cb.data_obtencao AS obtainedDate,
          COALESCE(cb.pontos_obtidos, b.pontos) AS points
        FROM c_obtem_b cb
        JOIN badge b ON b.nbadge = cb.nbadge
        LEFT JOIN area a ON a.narea = b.narea
        LEFT JOIN b_pertence_sl bps ON bps.nbadge = b.nbadge
        LEFT JOIN service_line sl ON sl.nsline = bps.nsline
        WHERE cb.nutilizador = :consultorId
        ORDER BY cb.data_obtencao DESC
      `,
      { replacements: { consultorId }, type: QueryTypes.SELECT }
    );

    // Buscar badges em progresso
    const badgesEmProgresso = await sequelize.query(
      `
        SELECT
          b.nbadge AS id,
          b.b_nome AS name,
          a.area AS areaName,
          sl.sline AS serviceLineName,
          p.estado AS status,
          p.data_pedido AS requestDate
        FROM pedidos p
        JOIN badge b ON b.nbadge = p.nbadge
        LEFT JOIN area a ON a.narea = b.narea
        LEFT JOIN b_pertence_sl bps ON bps.nbadge = b.nbadge
        LEFT JOIN service_line sl ON sl.nsline = bps.nsline
        WHERE p.nutilizador = :consultorId AND p.estado IN (2, 3)
        ORDER BY p.data_pedido DESC
      `,
      { replacements: { consultorId }, type: QueryTypes.SELECT }
    );

    res.status(200).json({
      consultor,
      badgesObtidos: badgesObtidos || [],
      badgesEmProgresso: badgesEmProgresso || []
    });
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to fetch consultor details.' });
  }
};

// Detalhes - Histórico de um badge específico
export const getDetalhesBadgeTM = async (req, res) => {
  const badgeId = parsePositiveId(req.query?.badgeId);

  if (!badgeId) {
    res.status(400).json({ message: 'Badge id is required.' });
    return;
  }

  try {
    // Buscar detalhes do badge
    const [badge] = await sequelize.query(
      `
        SELECT
          b.nbadge AS id,
          b.b_nome AS name,
          b.descricao AS description,
          a.area AS areaName,
          sl.sline AS serviceLineName,
          n.nivel AS level,
          b.pontos AS points
        FROM badge b
        LEFT JOIN area a ON a.narea = b.narea
        LEFT JOIN nivel n ON n.nnivel = b.nnivel
        LEFT JOIN b_pertence_sl bps ON bps.nbadge = b.nbadge
        LEFT JOIN service_line sl ON sl.nsline = bps.nsline
        WHERE b.nbadge = :badgeId
        LIMIT 1
      `,
      { replacements: { badgeId }, type: QueryTypes.SELECT }
    );

    if (!badge) {
      res.status(404).json({ message: 'Badge not found.' });
      return;
    }

    // Buscar consultores que obtiveram este badge
    const consultoresObtidos = await sequelize.query(
      `
        SELECT
          u.nutilizador AS id,
          u.nome AS name,
          u.email,
          sl.sline AS serviceLineName,
          cb.data_obtencao AS obtainedDate
        FROM c_obtem_b cb
        JOIN utilizador u ON u.nutilizador = cb.nutilizador
        LEFT JOIN b_pertence_sl bps ON bps.nbadge = cb.nbadge
        LEFT JOIN service_line sl ON sl.nsline = bps.nsline
        WHERE cb.nbadge = :badgeId
        ORDER BY cb.data_obtencao DESC
      `,
      { replacements: { badgeId }, type: QueryTypes.SELECT }
    );

    // Buscar consultores em progresso
    const consultoresEmProgresso = await sequelize.query(
      `
        SELECT
          u.nutilizador AS id,
          u.nome AS name,
          u.email,
          sl.sline AS serviceLineName,
          p.data_pedido AS requestDate,
          p.estado AS status
        FROM pedidos p
        JOIN utilizador u ON u.nutilizador = p.nutilizador
        LEFT JOIN b_pertence_sl bps ON bps.nbadge = p.nbadge
        LEFT JOIN service_line sl ON sl.nsline = bps.nsline
        WHERE p.nbadge = :badgeId AND p.estado IN (2, 3)
        ORDER BY p.data_pedido DESC
      `,
      { replacements: { badgeId }, type: QueryTypes.SELECT }
    );

    res.status(200).json({
      badge,
      consultoresObtidos: consultoresObtidos || [],
      consultoresEmProgresso: consultoresEmProgresso || [],
      totalObtidos: consultoresObtidos?.length || 0,
      totalEmProgresso: consultoresEmProgresso?.length || 0
    });
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to fetch badge details.' });
  }
};

// Detalhes - Histórico de uma service line específica
export const getDetalhesServiceLineTM = async (req, res) => {
  const serviceLineId = parsePositiveId(req.query?.serviceLineId);

  if (!serviceLineId) {
    res.status(400).json({ message: 'Service line id is required.' });
    return;
  }

  try {
    // Buscar detalhes da service line
    const [serviceLine] = await sequelize.query(
      `
        SELECT
          sl.nsline AS id,
          sl.sline AS name,
          COALESCE(slCounts.total_badges, 0) AS totalBadges,
          COALESCE(slCounts.obtidas, 0) AS obtidas,
          COALESCE(slCounts.em_progresso, 0) AS emProgresso,
          COALESCE(slCounts.total_consultores, 0) AS totalConsultores
        FROM service_line sl
        LEFT JOIN (
          SELECT
            bps.nsline,
            COUNT(DISTINCT b.nbadge) AS total_badges,
            COUNT(DISTINCT CASE WHEN cb.nbadge IS NOT NULL THEN cb.nbadge END) AS obtidas,
            COUNT(DISTINCT CASE WHEN p.npedido IS NOT NULL AND p.estado IN (2, 3) THEN p.nbadge END) AS em_progresso,
            COUNT(DISTINCT u.nutilizador) AS total_consultores
          FROM b_pertence_sl bps
          JOIN badge b ON b.nbadge = bps.nbadge
          LEFT JOIN c_obtem_b cb ON cb.nbadge = b.nbadge
          LEFT JOIN pedidos p ON p.nbadge = b.nbadge AND p.estado IN (2, 3)
          LEFT JOIN utilizador u ON (
            cb.nutilizador = u.nutilizador OR
            p.nutilizador = u.nutilizador
          ) AND LOWER(u.permissoes) LIKE '%consultor%'
          GROUP BY bps.nsline
        ) slCounts ON slCounts.nsline = sl.nsline
        WHERE sl.nsline = :serviceLineId
      `,
      { replacements: { serviceLineId }, type: QueryTypes.SELECT }
    );

    if (!serviceLine) {
      res.status(404).json({ message: 'Service line not found.' });
      return;
    }

    // Buscar áreas da service line
    const areas = await sequelize.query(
      `
        SELECT
          a.narea AS id,
          a.area AS name,
          COALESCE(aCounts.total_badges, 0) AS totalBadges,
          COALESCE(aCounts.obtidas, 0) AS obtidas,
          COALESCE(aCounts.em_progresso, 0) AS emProgresso
        FROM area a
        INNER JOIN badge b ON b.narea = a.narea
        INNER JOIN b_pertence_sl bps ON bps.nbadge = b.nbadge AND bps.nsline = :serviceLineId
        LEFT JOIN (
          SELECT
            b.narea,
            COUNT(DISTINCT b.nbadge) AS total_badges,
            COUNT(DISTINCT CASE WHEN cb.nbadge IS NOT NULL THEN cb.nbadge END) AS obtidas,
            COUNT(DISTINCT CASE WHEN p.npedido IS NOT NULL AND p.estado IN (2, 3) THEN p.nbadge END) AS em_progresso
          FROM badge b
          LEFT JOIN c_obtem_b cb ON cb.nbadge = b.nbadge
          LEFT JOIN pedidos p ON p.nbadge = b.nbadge AND p.estado IN (2, 3)
          WHERE b.narea IS NOT NULL
          GROUP BY b.narea
        ) aCounts ON aCounts.narea = a.narea
        GROUP BY a.narea, a.area, aCounts.total_badges, aCounts.obtidas, aCounts.em_progresso
        ORDER BY a.area ASC
      `,
      { replacements: { serviceLineId }, type: QueryTypes.SELECT }
    );

    // Buscar consultores da service line
    const consultores = await sequelize.query(
      `
        SELECT DISTINCT
          u.nutilizador AS id,
          u.nome AS name,
          u.email,
          COALESCE(bs.points, 0) AS points,
          COALESCE(bs.badges, 0) AS badgesObtidas,
          COALESCE(cCounts.em_progresso, 0) AS badgesEmProgresso
        FROM utilizador u
        INNER JOIN c_obtem_b cb ON cb.nutilizador = u.nutilizador
        INNER JOIN b_pertence_sl bps ON bps.nbadge = cb.nbadge AND bps.nsline = :serviceLineId
        LEFT JOIN (
          SELECT
            cb.nutilizador,
            SUM(COALESCE(NULLIF(cb.pontos_obtidos, 0), NULLIF(b.pontos, 0), 0)) AS points,
            COUNT(DISTINCT cb.nbadge) AS badges
          FROM c_obtem_b cb
          JOIN badge b ON b.nbadge = cb.nbadge
          GROUP BY cb.nutilizador
        ) bs ON bs.nutilizador = u.nutilizador
        LEFT JOIN (
          SELECT
            p.nutilizador,
            COUNT(DISTINCT p.nbadge) AS em_progresso
          FROM pedidos p
          WHERE p.estado IN (2, 3)
          GROUP BY p.nutilizador
        ) cCounts ON cCounts.nutilizador = u.nutilizador
        WHERE LOWER(u.permissoes) LIKE '%consultor%'
        GROUP BY u.nutilizador, u.nome, u.email, bs.points, bs.badges, cCounts.em_progresso
        ORDER BY u.nome ASC
      `,
      { replacements: { serviceLineId }, type: QueryTypes.SELECT }
    );

    res.status(200).json({
      serviceLine,
      areas: areas || [],
      consultores: consultores || []
    });
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to fetch service line details.' });
  }
};
