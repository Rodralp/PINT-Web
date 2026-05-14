import { communicationModel } from '../models/communicationModel.js';

export const communicationService = {
  listRecipients() {
    return communicationModel.listRecipients();
  },

  createAnnouncement(payload) {
    return communicationModel.createAnnouncement(payload);
  },

  getUserAnnouncements(accountId) {
    return communicationModel.getUserAnnouncements(accountId);
  },

  getUserNotifications(accountId) {
    return communicationModel.getUserNotifications(accountId);
  },

  markNotificationRead(accountId, notificationId) {
    return communicationModel.markNotificationRead(accountId, notificationId);
  },

  getAnnouncementAttachment(accountId, logId, fileId) {
    return communicationModel.getAnnouncementAttachment(accountId, logId, fileId);
  },
};
