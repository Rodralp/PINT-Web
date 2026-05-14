import { communicationService } from '../services/communicationService.js';

const parseAccountId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseNotificationId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getUserNotifications = async (req, res) => {
  const accountId = parseAccountId(req.query?.accountId);

  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await communicationService.getUserNotifications(accountId);
    res.status(200).json(data);
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    res.status(statusCode).json({ message: error?.message || 'Failed to fetch notifications.' });
  }
};

export const markNotificationRead = async (req, res) => {
  const accountId = parseAccountId(req.body?.accountId);
  const notificationId = parseNotificationId(req.params?.notificationId);

  if (!accountId || !notificationId) {
    res.status(400).json({ message: 'Account id and notification id are required.' });
    return;
  }

  try {
    const updatedId = await communicationService.markNotificationRead(accountId, notificationId);
    if (!updatedId) {
      res.status(404).json({ message: 'Notification not found.' });
      return;
    }

    res.status(200).json({ updated: true, id: updatedId });
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    res.status(statusCode).json({ message: error?.message || 'Failed to update notification.' });
  }
};
