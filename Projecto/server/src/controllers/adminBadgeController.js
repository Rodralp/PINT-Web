import { adminBadgeService } from '../services/adminBadgeService.js';
import { adminLearningPathService } from '../services/adminLearningPathService.js';

const parseEntityId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeText = (value, maxLength) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }

  if (Number.isInteger(maxLength) && maxLength > 0) {
    return normalized.slice(0, maxLength);
  }

  return normalized;
};

const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return null;
};

const parsePoints = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toBadgeResponse = (row) => ({
  id: `badge-${Number(row.nbadge)}`,
  badgeDbId: Number(row.nbadge),
  name: row.b_nome,
  description: row.b_descricao,
  points: Number(row.pontos) || 0,
  levelId: row.levelId || null,
  levelTitle: row.levelTitle || null,
  isSpecial: Boolean(row.isSpecial),
  typeName: row.typeName || null,
});

export const getBadge = async (req, res) => {
  const badgeId = parseEntityId(req.params?.badgeId);

  if (!badgeId) {
    res.status(400).json({ message: 'Badge id is required.' });
    return;
  }

  try {
    const row = await adminBadgeService.getBadge(badgeId);
    if (!row) {
      res.status(404).json({ message: 'Badge not found.' });
      return;
    }

    res.status(200).json(toBadgeResponse(row));
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to fetch badge.' });
  }
};

export const createBadge = async (req, res) => {
  const name = normalizeText(req.body?.name, 25);
  const description = normalizeText(req.body?.description, 255);
  const isSpecial = parseBoolean(req.body?.isSpecial);
  const levelId = parseEntityId(req.body?.levelId);
  const points = parsePoints(req.body?.points);

  if (!name) {
    res.status(400).json({ message: 'Name is required.' });
    return;
  }

  const badgeDescription = description || `Badge ${name}`;
  const specialFlag = isSpecial === null ? false : isSpecial;

  if (!specialFlag && !levelId) {
    res.status(400).json({ message: 'Level id is required for standard badges.' });
    return;
  }

  if (!specialFlag) {
    const levelExists = await adminLearningPathService.hasLevel(levelId);
    if (!levelExists) {
      res.status(404).json({ message: 'Level not found.' });
      return;
    }
  }

  try {
    const row = await adminBadgeService.createBadge({
      name,
      description: badgeDescription,
      points,
      levelId,
      isSpecial: specialFlag,
    });

    if (!row) {
      res.status(400).json({ message: 'Unable to create badge.' });
      return;
    }

    res.status(201).json(toBadgeResponse(row));
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to create badge.' });
  }
};

export const updateBadge = async (req, res) => {
  const badgeId = parseEntityId(req.params?.badgeId);
  const name = normalizeText(req.body?.name, 25);
  const description = normalizeText(req.body?.description, 255);
  const isSpecial = parseBoolean(req.body?.isSpecial);
  const levelId = parseEntityId(req.body?.levelId);
  const points = parsePoints(req.body?.points);

  if (!badgeId) {
    res.status(400).json({ message: 'Badge id is required.' });
    return;
  }

  if (!name) {
    res.status(400).json({ message: 'Name is required.' });
    return;
  }

  const badgeDescription = description || `Badge ${name}`;
  const specialFlag = isSpecial === null ? false : isSpecial;

  if (!specialFlag && !levelId) {
    res.status(400).json({ message: 'Level id is required for standard badges.' });
    return;
  }

  if (!specialFlag) {
    const levelExists = await adminLearningPathService.hasLevel(levelId);
    if (!levelExists) {
      res.status(404).json({ message: 'Level not found.' });
      return;
    }
  }

  try {
    const row = await adminBadgeService.updateBadge({
      badgeId,
      name,
      description: badgeDescription,
      points,
      levelId,
      isSpecial: specialFlag,
    });

    if (!row) {
      res.status(404).json({ message: 'Badge not found.' });
      return;
    }

    res.status(200).json(toBadgeResponse(row));
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to update badge.' });
  }
};
