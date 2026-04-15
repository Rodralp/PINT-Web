import apiClient from './apiClient';

export async function fetchTalentManagerDashboard() {
  const response = await apiClient.get('/dashboard/talent-manager');
  return response.data;
}

export async function fetchServiceLineLeaderDashboard() {
  const response = await apiClient.get('/dashboard/service-line-leader');
  return response.data;
}

export async function fetchAdminGestorDashboard() {
  const response = await apiClient.get('/dashboard/admin-gestor');
  return response.data;
}

export async function fetchConsultorDashboard() {
  const response = await apiClient.get('/dashboard/consultor');
  return response.data;
}
