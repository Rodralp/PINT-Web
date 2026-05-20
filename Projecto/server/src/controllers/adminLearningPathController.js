import { adminLearningPathService } from '../services/adminLearningPathService.js';

const parseEntityId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeText = (value) => String(value || '').trim();

const isUniqueViolation = (error) => {
  const code = error?.original?.code || error?.parent?.code;
  return code === '23505';
};

const toLearningPathResponse = (row) => ({
  id: Number(row?.nlpath),
  name: row?.lpath,
  description: row?.lp_desc,
});

const toServiceLineResponse = (row) => ({
  id: Number(row?.nsline),
  name: row?.sline,
  description: row?.sl_desc,
  learningPathId: Number(row?.nlpath),
});

const toAreaResponse = (row) => ({
  id: Number(row?.narea),
  name: row?.area,
  description: row?.a_desc,
  serviceLineId: Number(row?.nsline),
});

const toLevelResponse = (row) => ({
  id: Number(row?.nnivel),
  title: row?.nivel,
  areaId: Number(row?.narea),
});

export const listLearningPaths = async (_req, res) => {
  try {
    const data = await adminLearningPathService.listLearningPaths();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to fetch learning paths.' });
  }
};

export const createLearningPath = async (req, res) => {
  const name = normalizeText(req.body?.name);
  const description = normalizeText(req.body?.description);

  if (!name || !description) {
    res.status(400).json({ message: 'Name and description are required.' });
    return;
  }

  try {
    const row = await adminLearningPathService.createLearningPath({ name, description });
    res.status(201).json(toLearningPathResponse(row));
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to create learning path.' });
  }
};

export const updateLearningPath = async (req, res) => {
  const learningPathId = parseEntityId(req.params?.learningPathId);
  const name = normalizeText(req.body?.name);
  const description = normalizeText(req.body?.description);

  if (!learningPathId) {
    res.status(400).json({ message: 'Learning path id is required.' });
    return;
  }

  if (!name || !description) {
    res.status(400).json({ message: 'Name and description are required.' });
    return;
  }

  try {
    const row = await adminLearningPathService.updateLearningPath({ learningPathId, name, description });

    if (!row) {
      res.status(404).json({ message: 'Learning path not found.' });
      return;
    }

    res.status(200).json(toLearningPathResponse(row));
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to update learning path.' });
  }
};

export const createServiceLine = async (req, res) => {
  const learningPathId = parseEntityId(req.params?.learningPathId);
  const name = normalizeText(req.body?.name);
  const description = normalizeText(req.body?.description);

  if (!learningPathId) {
    res.status(400).json({ message: 'Learning path id is required.' });
    return;
  }

  if (!name || !description) {
    res.status(400).json({ message: 'Name and description are required.' });
    return;
  }

  try {
    const exists = await adminLearningPathService.hasLearningPath(learningPathId);

    if (!exists) {
      res.status(404).json({ message: 'Learning path not found.' });
      return;
    }

    const row = await adminLearningPathService.createServiceLine({ learningPathId, name, description });
    res.status(201).json(toServiceLineResponse(row));
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to create service line.' });
  }
};

export const updateServiceLine = async (req, res) => {
  const serviceLineId = parseEntityId(req.params?.serviceLineId);
  const name = normalizeText(req.body?.name);
  const description = normalizeText(req.body?.description);

  if (!serviceLineId) {
    res.status(400).json({ message: 'Service line id is required.' });
    return;
  }

  if (!name || !description) {
    res.status(400).json({ message: 'Name and description are required.' });
    return;
  }

  try {
    const row = await adminLearningPathService.updateServiceLine({ serviceLineId, name, description });

    if (!row) {
      res.status(404).json({ message: 'Service line not found.' });
      return;
    }

    res.status(200).json(toServiceLineResponse(row));
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to update service line.' });
  }
};

export const createArea = async (req, res) => {
  const serviceLineId = parseEntityId(req.params?.serviceLineId);
  const name = normalizeText(req.body?.name);
  const description = normalizeText(req.body?.description);

  if (!serviceLineId) {
    res.status(400).json({ message: 'Service line id is required.' });
    return;
  }

  if (!name || !description) {
    res.status(400).json({ message: 'Name and description are required.' });
    return;
  }

  try {
    const exists = await adminLearningPathService.hasServiceLine(serviceLineId);

    if (!exists) {
      res.status(404).json({ message: 'Service line not found.' });
      return;
    }

    const row = await adminLearningPathService.createArea({ serviceLineId, name, description });
    res.status(201).json(toAreaResponse(row));
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to create area.' });
  }
};

export const updateArea = async (req, res) => {
  const areaId = parseEntityId(req.params?.areaId);
  const name = normalizeText(req.body?.name);
  const description = normalizeText(req.body?.description);

  if (!areaId) {
    res.status(400).json({ message: 'Area id is required.' });
    return;
  }

  if (!name || !description) {
    res.status(400).json({ message: 'Name and description are required.' });
    return;
  }

  try {
    const row = await adminLearningPathService.updateArea({ areaId, name, description });

    if (!row) {
      res.status(404).json({ message: 'Area not found.' });
      return;
    }

    res.status(200).json(toAreaResponse(row));
  } catch (error) {
    res.status(500).json({ message: error?.message || 'Failed to update area.' });
  }
};

export const createLevel = async (req, res) => {
  const areaId = parseEntityId(req.params?.areaId);
  const title = normalizeText(req.body?.title);

  if (!areaId) {
    res.status(400).json({ message: 'Area id is required.' });
    return;
  }

  if (!title) {
    res.status(400).json({ message: 'Title is required.' });
    return;
  }

  try {
    const exists = await adminLearningPathService.hasArea(areaId);

    if (!exists) {
      res.status(404).json({ message: 'Area not found.' });
      return;
    }

    const row = await adminLearningPathService.createLevel({ areaId, title });
    res.status(201).json(toLevelResponse(row));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ message: 'Nivel ja existe.' });
      return;
    }

    res.status(500).json({ message: error?.message || 'Failed to create level.' });
  }
};

export const updateLevel = async (req, res) => {
  const levelId = parseEntityId(req.params?.levelId);
  const title = normalizeText(req.body?.title);

  if (!levelId) {
    res.status(400).json({ message: 'Level id is required.' });
    return;
  }

  if (!title) {
    res.status(400).json({ message: 'Title is required.' });
    return;
  }

  try {
    const row = await adminLearningPathService.updateLevel({ levelId, title });

    if (!row) {
      res.status(404).json({ message: 'Level not found.' });
      return;
    }

    res.status(200).json(toLevelResponse(row));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ message: 'Nivel ja existe.' });
      return;
    }

    res.status(500).json({ message: error?.message || 'Failed to update level.' });
  }
};
