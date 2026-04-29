import { consultorModel } from '../models/consultorModel.js';

export const consultorService = {
  async getCatalogBadges() {
    return consultorModel.getCatalogBadges();
  },

  getLearningPaths(accountId) {
    return consultorModel.getLearningPaths(accountId);
  },

  getMyBadges(accountId) {
    return consultorModel.getMyBadges(accountId);
  },

  requestBadgeAcquisition(accountId, badgeId) {
    return consultorModel.requestBadgeAcquisition(accountId, badgeId);
  },

  getPreferenceAreas(accountId) {
    return consultorModel.getPreferenceAreas(accountId);
  },

  getPreferences(accountId) {
    return consultorModel.getPreferences(accountId);
  },

  savePreferences(accountId, areaIds) {
    return consultorModel.savePreferences(accountId, areaIds);
  },

  getBadgeSuggestions(accountId, limit) {
    return consultorModel.getBadgeSuggestions(accountId, limit);
  },

  getMyRequests(accountId) {
    return consultorModel.getMyRequests(accountId);
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
