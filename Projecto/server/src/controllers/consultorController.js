import { consultorService } from '../services/consultorService.js';

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

export const getReminders = async (_req, res) => {
  try {
    const data = await consultorService.getReminders();
    res.status(200).json(data);
  } catch {
    res.status(500).json({ message: 'Failed to fetch reminders.' });
  }
};

export const createReminder = async (req, res) => {
  const { title, description, date, color } = req.body ?? {};

  if (!title || !description || !date || !color) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    const data = await consultorService.createReminder({ title, description, date, color });
    res.status(201).json(data);
  } catch {
    res.status(500).json({ message: 'Failed to create reminder.' });
  }
};

export const updateReminder = async (req, res) => {
  const { title, description, date, color } = req.body ?? {};

  if (!title || !description || !date || !color) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    const data = await consultorService.updateReminder(req.params.id, { title, description, date, color });
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
  try {
    const deleted = await consultorService.deleteReminder(req.params.id);
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
