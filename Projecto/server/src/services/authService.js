import { authModel } from '../models/authModel.js';

export const authService = {
  async registerAccount(payload) {
    return authModel.register(payload);
  },

  async loginAccount(payload) {
    return authModel.login(payload);
  },

  async recoverPassword(email) {
    return authModel.recoverPassword(email);
  },

  async changePassword(payload) {
    return authModel.changePassword(payload);
  },
};
