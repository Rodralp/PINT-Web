import { dashboardModel } from '../models/dashboardModel.js';

export const dashboardService = {
  getTalentManagerDashboard() {
    return dashboardModel.getTalentManagerDashboardData();
  },

  getServiceLineLeaderDashboard() {
    return dashboardModel.getServiceLineLeaderDashboardData();
  },

  getAdminGestorDashboard() {
    return dashboardModel.getAdminGestorDashboardData();
  },

  getConsultorDashboard() {
    return dashboardModel.getConsultorDashboardData();
  },
};
