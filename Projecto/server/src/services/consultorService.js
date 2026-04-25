import { consultorModel } from '../models/consultorModel.js';

export const consultorService = {
  getCatalogBadges() {
    return consultorModel.getCatalogBadges();
  },

  getLearningPaths() {
    return consultorModel.getLearningPaths();
  },

  getMyBadges() {
    return consultorModel.getMyBadges();
  },

  getMyRequests() {
    return consultorModel.getMyRequests();
  },

  getRankingConsultores() {
    return consultorModel.getRankingConsultores();
  },

  async getReminders(accountId) {
    return consultorModel.getReminders(accountId);
  },

  async createReminder(accountId, payload) {
    return consultorModel.createReminder(accountId, payload);
  },

  async updateReminder(id, accountId, payload) {
    return consultorModel.updateReminder(id, accountId, payload);
  },

  async deleteReminder(id, accountId) {
    return consultorModel.deleteReminder(id, accountId);
  },

  getProfileData() {
    return consultorModel.getProfileData();
  },
};
