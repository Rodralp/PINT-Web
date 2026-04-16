import { Account } from './sql/Account.js';

const DEFAULT_ROLE = 'consultor';

const normalizeEmail = (value) => value.trim().toLowerCase();

const normalizeRoles = (rolesValue) => {
  const rawRoles = Array.isArray(rolesValue)
    ? rolesValue
    : typeof rolesValue === 'string'
      ? rolesValue.split(';')
      : [];

  const parsedRoles = rawRoles
    .map((role) => String(role).trim().toLowerCase())
    .filter(Boolean);

  const uniqueRoles = [...new Set(parsedRoles)];
  return uniqueRoles.length > 0 ? uniqueRoles : [DEFAULT_ROLE];
};

const sanitizeAccount = (account) => {
  const roles = normalizeRoles(account.role);

  return {
    id: account.id,
    nome: account.nome,
    email: account.email,
    role: roles[0],
    roles,
    status: account.status,
  };
};

export const authModel = {
  async register({ nome, email, senha }) {
    const normalizedEmail = normalizeEmail(email);

    const alreadyExists = await Account.findOne({ where: { email: normalizedEmail } });
    if (alreadyExists) {
      return null;
    }

    const account = await Account.create({
      nome: nome.trim(),
      email: normalizedEmail,
      senha,
      role: 'consultor',
      status: 'pendente',
    });

    return sanitizeAccount(account);
  },

  async login({ email, senha }) {
    const normalizedEmail = normalizeEmail(email);

    const account = await Account.findOne({ where: { email: normalizedEmail, senha } });

    if (!account) {
      return { status: 'invalid_credentials' };
    }

    if (String(account.status).toLowerCase() === 'pendente') {
      return {
        status: 'pending_approval',
        account: sanitizeAccount(account),
      };
    }

    return {
      status: 'ok',
      account: sanitizeAccount(account),
    };
  },

  async findByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    return Account.findOne({ where: { email: normalizedEmail } });
  },

  async recoverPassword(email) {
    const account = await this.findByEmail(email);
    return account ? account.senha : null;
  },
};
