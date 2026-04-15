import { dashboardService } from '../services/dashboardService.js';

export const getTalentManagerDashboard = (_req, res) => {
  try {
    const dashboardData = dashboardService.getTalentManagerDashboard();
    res.status(200).json(dashboardData);
  } catch {
    res.status(500).json({ message: 'Failed to fetch dashboard data.' });
  }
};

export const getServiceLineLeaderDashboard = (_req, res) => {
  try {
    const dashboardData = dashboardService.getServiceLineLeaderDashboard();
    res.status(200).json(dashboardData);
  } catch {
    res.status(500).json({ message: 'Failed to fetch dashboard data.' });
  }
};

export const getAdminGestorDashboard = (_req, res) => {
  try {
    const dashboardData = dashboardService.getAdminGestorDashboard();
    res.status(200).json(dashboardData);
  } catch {
    res.status(500).json({ message: 'Failed to fetch dashboard data.' });
  }
};

export const getConsultorDashboard = (_req, res) => {
  try {
    const dashboardData = dashboardService.getConsultorDashboard();
    res.status(200).json(dashboardData);
  } catch {
    res.status(500).json({ message: 'Failed to fetch dashboard data.' });
  }
};
