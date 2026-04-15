import apiClient from './apiClient';

const ACCOUNTS_STORAGE_KEY = 'contasCriadas';

const normalizeEmail = (value) => value.trim().toLowerCase();

const safeParseAccounts = (value) => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const sanitizeAccount = (account) => ({
  id: account.id,
  nome: account.nome,
  email: account.email,
  role: account.role || 'consultor',
  status: account.status || 'pendente',
});

const getStoredAccounts = () => {
  const localAccounts = safeParseAccounts(localStorage.getItem(ACCOUNTS_STORAGE_KEY));
  const sessionAccounts = safeParseAccounts(sessionStorage.getItem(ACCOUNTS_STORAGE_KEY));
  const accountMap = new Map();

  [...localAccounts, ...sessionAccounts].forEach((account, index) => {
    if (!account?.email) {
      return;
    }

    const normalizedEmail = normalizeEmail(account.email);
    if (!accountMap.has(normalizedEmail)) {
      accountMap.set(normalizedEmail, {
        id: account.id || index + 1,
        nome: account.nome || '',
        email: normalizedEmail,
        senha: account.senha || '',
        role: account.role || 'consultor',
        status: account.status || 'pendente',
      });
    }
  });

  return Array.from(accountMap.values());
};

const saveStoredAccounts = (accounts) => {
  const serialized = JSON.stringify(accounts);
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, serialized);
  sessionStorage.setItem(ACCOUNTS_STORAGE_KEY, serialized);
};

const upsertStoredAccount = (account) => {
  const normalizedEmail = normalizeEmail(account.email);
  const existing = getStoredAccounts();
  const nextAccounts = existing.filter((item) => normalizeEmail(item.email) !== normalizedEmail);
  nextAccounts.push({
    id: account.id,
    nome: account.nome,
    email: normalizedEmail,
    senha: account.senha,
    role: account.role || 'consultor',
    status: account.status || 'pendente',
  });
  saveStoredAccounts(nextAccounts);
};

export async function registerAccount(payload) {
  const nome = payload?.nome?.trim() || '';
  const email = normalizeEmail(payload?.email || '');
  const senha = payload?.senha || '';

  if (!nome || !email || !senha) {
    throw new Error('Missing required fields.');
  }

  const storedAccounts = getStoredAccounts();
  const accountAlreadyExists = storedAccounts.some((item) => normalizeEmail(item.email) === email);
  if (accountAlreadyExists) {
    throw new Error('Email already registered.');
  }

  const nextId = storedAccounts.length > 0 ? Math.max(...storedAccounts.map((item) => Number(item.id) || 0)) + 1 : 1;
  const localAccount = {
    id: nextId,
    nome,
    email,
    senha,
    role: 'consultor',
    status: 'pendente',
  };

  saveStoredAccounts([...storedAccounts, localAccount]);

  try {
    const response = await apiClient.post('/auth/register', { nome, email, senha });
    return response.data;
  } catch {
    return sanitizeAccount(localAccount);
  }
}

export async function loginAccount(payload) {
  const email = normalizeEmail(payload?.email || '');
  const senha = payload?.senha || '';

  const localAccount = getStoredAccounts().find(
    (item) => normalizeEmail(item.email) === email && item.senha === senha,
  );

  if (localAccount) {
    return sanitizeAccount(localAccount);
  }

  const response = await apiClient.post('/auth/login', { email, senha });
  const remoteAccount = response.data;

  if (remoteAccount?.email) {
    upsertStoredAccount({
      ...remoteAccount,
      email: remoteAccount.email,
      senha,
    });
  }

  return remoteAccount;
}

export async function recoverPassword(payload) {
  const email = normalizeEmail(payload?.email || '');

  const localAccount = getStoredAccounts().find((item) => normalizeEmail(item.email) === email);
  if (localAccount?.senha) {
    return { password: localAccount.senha };
  }

  const response = await apiClient.post('/auth/recover-password', { email });
  return response.data;
}
