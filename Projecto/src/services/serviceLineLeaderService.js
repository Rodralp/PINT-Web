import apiClient from './apiClient';

export async function fetchMyServiceLine(accountId) {
  const response = await apiClient.get(`/service-line-leader/minha-service-line?accountId=${encodeURIComponent(accountId)}`);
  return response.data;
}

export async function fetchHistoricoAreasSLL(accountId) {
  const response = await apiClient.get(`/service-line-leader/historico/areas?accountId=${encodeURIComponent(accountId)}`);
  return response.data;
}

export async function fetchHistoricoBadgesSLL(accountId) {
  const response = await apiClient.get(`/service-line-leader/historico/badges?accountId=${encodeURIComponent(accountId)}`);
  return response.data;
}

export async function fetchHistoricoConsultoresSLL(accountId) {
  const response = await apiClient.get(`/service-line-leader/historico/consultores?accountId=${encodeURIComponent(accountId)}`);
  return response.data;
}

export async function fetchDetalhesConsultorSLL(accountId, consultorId) {
  const response = await apiClient.get(`/service-line-leader/historico/consultor?accountId=${encodeURIComponent(accountId)}&consultorId=${encodeURIComponent(consultorId)}`);
  return response.data;
}

export async function fetchDetalhesBadgeSLL(accountId, badgeId) {
  const response = await apiClient.get(`/service-line-leader/historico/badge?accountId=${encodeURIComponent(accountId)}&badgeId=${encodeURIComponent(badgeId)}`);
  return response.data;
}
