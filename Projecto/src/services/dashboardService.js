import apiClient from './apiClient';

const getStoredLoginData = () => {
  const sessionLoginData = sessionStorage.getItem('loginData');
  if (sessionLoginData) {
    try {
      return JSON.parse(sessionLoginData);
    } catch {
      return null;
    }
  }

  const localLoginData = localStorage.getItem('loginData');
  if (!localLoginData) {
    return null;
  }

  try {
    return JSON.parse(localLoginData);
  } catch {
    return null;
  }
};

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
  const loginData = getStoredLoginData();
  const accountId = Number(loginData?.id);
  const path = Number.isInteger(accountId) && accountId > 0
    ? `/dashboard/consultor?accountId=${accountId}`
    : '/dashboard/consultor';

  const response = await apiClient.get(path);
  return response.data;
}
