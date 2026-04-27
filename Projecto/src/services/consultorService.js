import apiClient from './apiClient';

const getStoredLoginData = () => {
  const sessionLoginData = sessionStorage.getItem('loginData');

  if (sessionLoginData) {
    try {
      return { data: JSON.parse(sessionLoginData), source: 'session' };
    } catch {
      return null;
    }
  }

  const localLoginData = localStorage.getItem('loginData');

  if (!localLoginData) {
    return null;
  }

  try {
    return { data: JSON.parse(localLoginData), source: 'local' };
  } catch {
    return null;
  }
};

const persistLoginData = (source, data) => {
  const serialized = JSON.stringify(data);

  if (source === 'local') {
    localStorage.setItem('loginData', serialized);
    sessionStorage.removeItem('loginData');
    return;
  }

  if (source === 'session') {
    sessionStorage.setItem('loginData', serialized);
    localStorage.removeItem('loginData');
    return;
  }

  if (data?.guardarDados) {
    localStorage.setItem('loginData', serialized);
    sessionStorage.removeItem('loginData');
  } else {
    sessionStorage.setItem('loginData', serialized);
    localStorage.removeItem('loginData');
  }
};

const ensureLoggedAccountId = async () => {
  const stored = getStoredLoginData();

  if (!stored?.data) {
    return null;
  }

  const currentAccountId = Number(stored.data.id);
  if (Number.isInteger(currentAccountId) && currentAccountId > 0) {
    return currentAccountId;
  }

  const email = String(stored.data.email || '').trim();
  const senha = String(stored.data.senha || '');

  if (!email || !senha) {
    return null;
  }

  try {
    const response = await apiClient.post('/auth/login', { email, senha });
    const refreshedAccount = response.data;
    const refreshedAccountId = Number(refreshedAccount?.id);

    if (!Number.isInteger(refreshedAccountId) || refreshedAccountId <= 0) {
      return null;
    }

    persistLoginData(stored.source, {
      ...stored.data,
      id: refreshedAccountId,
      nome: refreshedAccount?.nome || stored.data.nome,
      email: refreshedAccount?.email || stored.data.email,
      role: refreshedAccount?.role || stored.data.role,
      roles: refreshedAccount?.roles || stored.data.roles,
      status: refreshedAccount?.status || stored.data.status,
    });

    return refreshedAccountId;
  } catch {
    return null;
  }
};

export async function fetchCatalogBadges() {
  const response = await apiClient.get('/consultor/catalog-badges');
  return response.data;
}

export async function fetchLearningPaths() {
  const accountId = await ensureLoggedAccountId();
  if (!accountId) {
    throw new Error('Missing logged account id.');
  }

  const response = await apiClient.get(`/consultor/learning-paths?accountId=${accountId}`);
  return response.data;
}

export async function fetchMyBadges() {
  const accountId = await ensureLoggedAccountId();
  if (!accountId) {
    throw new Error('Missing logged account id.');
  }

  const response = await apiClient.get(`/consultor/meus-badges?accountId=${accountId}`);
  return response.data;
}

export async function requestBadgeAcquisition(badgeId) {
  const accountId = await ensureLoggedAccountId();
  if (!accountId) {
    throw new Error('Missing logged account id.');
  }

  const response = await apiClient.post(`/consultor/badges/${encodeURIComponent(badgeId)}/adquirir`, { accountId });
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
  const accountId = await ensureLoggedAccountId();
  if (!accountId) {
    throw new Error('Missing logged account id.');
  }

  const response = await apiClient.get(`/consultor/lembretes?accountId=${accountId}`);
  return response.data;
}

export async function createReminder(payload) {
  const accountId = await ensureLoggedAccountId();
  if (!accountId) {
    throw new Error('Missing logged account id.');
  }

  const response = await apiClient.post('/consultor/lembretes', { ...payload, accountId });
  return response.data;
}

export async function updateReminder(id, payload) {
  const accountId = await ensureLoggedAccountId();
  if (!accountId) {
    throw new Error('Missing logged account id.');
  }

  const response = await apiClient.put(`/consultor/lembretes/${id}`, { ...payload, accountId });
  return response.data;
}

export async function deleteReminder(id) {
  const accountId = await ensureLoggedAccountId();
  if (!accountId) {
    throw new Error('Missing logged account id.');
  }

  await apiClient.delete(`/consultor/lembretes/${id}?accountId=${accountId}`);
}

export async function fetchProfileData() {
  const response = await apiClient.get('/consultor/profile');
  return response.data;
}
