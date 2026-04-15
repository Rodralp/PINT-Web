import { consultorModel } from '../models/consultorModel.js';

export const consultorService = {
  getCatalogBadges() {
    return consultorModel.getCatalogBadges();
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

  async getReminders() {
    return consultorModel.getReminders();
  },

  async createReminder(payload) {
    return consultorModel.createReminder(payload);
  },

  async updateReminder(id, payload) {
    return consultorModel.updateReminder(id, payload);
  },

  async deleteReminder(id) {
    return consultorModel.deleteReminder(id);
  },

  getProfileData() {
    return consultorModel.getProfileData();
  },
};
