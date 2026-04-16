import { consultorService } from '../services/consultorService.js';

const parseAccountId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getCatalogBadges = (_req, res) => {
  const data = consultorService.getCatalogBadges();
  res.status(200).json(data);
};

export const getMyBadges = (_req, res) => {
  const data = consultorService.getMyBadges();
  res.status(200).json(data);
};

export const getMyRequests = (_req, res) => {
  const data = consultorService.getMyRequests();
  res.status(200).json(data);
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
