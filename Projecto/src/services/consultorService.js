import apiClient from './apiClient';

export async function fetchCatalogBadges() {
  const response = await apiClient.get('/consultor/catalog-badges');
  return response.data;
}

export async function fetchMyBadges() {
  const response = await apiClient.get('/consultor/meus-badges');
  return response.data;
}

export async function fetchMyRequests() {
  const response = await apiClient.get('/consultor/meus-pedidos');
  return response.data;
}

export async function fetchRankingConsultores() {
  const response = await apiClient.get('/consultor/ranking');
  return response.data;
}

export async function fetchReminders() {
  const response = await apiClient.get('/consultor/lembretes');
  return response.data;
}

export async function createReminder(payload) {
  const response = await apiClient.post('/consultor/lembretes', payload);
  return response.data;
}

export async function updateReminder(id, payload) {
  const response = await apiClient.put(`/consultor/lembretes/${id}`, payload);
  return response.data;
}

export async function deleteReminder(id) {
  await apiClient.delete(`/consultor/lembretes/${id}`);
}

export async function fetchProfileData() {
  const response = await apiClient.get('/consultor/profile');
  return response.data;
}
