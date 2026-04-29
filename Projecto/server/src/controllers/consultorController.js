import { consultorService } from '../services/consultorService.js';

const parseAccountId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getCatalogBadges = async (_req, res) => {
  try {
    const data = await consultorService.getCatalogBadges();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch catalog badges.', error: error.message });
  }
};

export const getLearningPaths = async (req, res) => {
  const accountId = parseAccountId(req.query?.accountId);
  
  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await consultorService.getLearningPaths(accountId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch learning paths.', error: error.message });
  }
};

export const getMyBadges = async (req, res) => {
  const accountId = parseAccountId(req.query?.accountId);

  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await consultorService.getMyBadges(accountId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch badges.', error: error.message });
  }
};

export const acquireBadge = async (req, res) => {
  const accountId = parseAccountId(req.body?.accountId);
  const badgeId = parseAccountId(req.params?.badgeId);

  if (!accountId || !badgeId) {
    res.status(400).json({ message: 'Account id and badge id are required.' });
    return;
  }

  try {
    const data = await consultorService.requestBadgeAcquisition(accountId, badgeId);
    res.status(200).json(data);
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    res.status(statusCode).json({ message: error?.message || 'Failed to submit badge request.' });
  }
};

export const getPreferenceAreas = async (req, res) => {
  const accountId = parseAccountId(req.query?.accountId);
  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await consultorService.getPreferenceAreas(accountId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch preference areas.', error: error.message });
  }
};

export const getPreferences = async (req, res) => {
  const accountId = parseAccountId(req.query?.accountId);
  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await consultorService.getPreferences(accountId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch preferences.', error: error.message });
  }
};

export const savePreferences = async (req, res) => {
  const accountId = parseAccountId(req.body?.accountId);
  const areaIds = Array.isArray(req.body?.areaIds) ? req.body.areaIds : [];

  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await consultorService.savePreferences(accountId, areaIds);
    res.status(200).json(data);
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    res.status(statusCode).json({ message: error?.message || 'Failed to save preferences.' });
  }
};

export const getBadgeSuggestions = async (req, res) => {
  const accountId = parseAccountId(req.query?.accountId);
  const limit = Number(req.query?.limit);

  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await consultorService.getBadgeSuggestions(accountId, limit);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch suggestions.', error: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  const accountId = parseAccountId(req.query?.accountId);
  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await consultorService.getMyRequests(accountId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests.', error: error.message });
  }
};

export const getRankingConsultores = (_req, res) => {
  const data = consultorService.getRankingConsultores();
  res.status(200).json(data);
};

export const getReminders = async (req, res) => {
  const accountId = parseAccountId(req.query?.accountId);
  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await consultorService.getReminders(accountId);
    res.status(200).json(data);
  } catch {
    res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
};

export const createReminder = async (req, res) => {
  const { title, description, date, color, accountId: rawAccountId } = req.body ?? {};
  const accountId = parseAccountId(rawAccountId);

  if (!title || !description || !date || !color || !accountId) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    const data = await consultorService.createReminder(accountId, { title, description, date, color });
    res.status(201).json(data);
  } catch {
    res.status(500).json({ message: 'Failed to create reminder.' });
  }
};

export const updateReminder = async (req, res) => {
  const { title, description, date, color, accountId: rawAccountId } = req.body ?? {};
  const accountId = parseAccountId(rawAccountId);

  if (!title || !description || !date || !color || !accountId) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    const data = await consultorService.updateReminder(req.params.id, accountId, { title, description, date, color });
    if (!data) {
      res.status(404).json({ message: 'Reminder not found.' });
      return;
    }

    res.status(200).json(data);
  } catch {
    res.status(500).json({ message: 'Failed to update reminder.' });
  }
};

export const deleteReminder = async (req, res) => {
  const accountId = parseAccountId(req.query?.accountId);
  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const deleted = await consultorService.deleteReminder(req.params.id, accountId);
    if (!deleted) {
      res.status(404).json({ message: 'Reminder not found.' });
      return;
    }

    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Failed to delete reminder.' });
  }
};

export const getProfileData = (_req, res) => {
  const data = consultorService.getProfileData();
  res.status(200).json(data);
};
