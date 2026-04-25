import apiClient from './apiClient';

export async function fetchMyServiceLine(accountId) {
  const response = await apiClient.get(`/service-line-leader/minha-service-line?accountId=${encodeURIComponent(accountId)}`);
  return response.data;
}
