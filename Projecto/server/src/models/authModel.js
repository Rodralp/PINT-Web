import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
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

const sanitizeAccount = (account, hasPreferences = false) => {
  const roles = normalizeRoles(account.role);

  return {
    id: account.id,
    nome: account.nome,
    email: account.email,
    role: roles[0],
    roles,
    status: account.status,
    hasPreferences: Boolean(hasPreferences),
  };
};

const getHasPreferences = async (accountId) => {
  if (!Number.isInteger(Number(accountId)) || Number(accountId) <= 0) {
    return false;
  }

  const [row] = await sequelize.query(
    `
      SELECT COUNT(*)::int AS total
      FROM preferencias
      WHERE nutilizador = :accountId
    `,
    {
      replacements: { accountId: Number(accountId) },
      type: QueryTypes.SELECT,
    },
  );

  return Number(row?.total) > 0;
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

    return sanitizeAccount(account, false);
  },

  async login({ email, senha }) {
    const normalizedEmail = normalizeEmail(email);

    const account = await Account.findOne({ where: { email: normalizedEmail, senha } });

    if (!account) {
      return { status: 'invalid_credentials' };
    }

    if (String(account.status).toLowerCase() === 'pendente') {
      const hasPreferences = await getHasPreferences(account.id);
      return {
        status: 'pending_approval',
        account: sanitizeAccount(account, hasPreferences),
      };
    }

    const hasPreferences = await getHasPreferences(account.id);

    return {
      status: 'ok',
      account: sanitizeAccount(account, hasPreferences),
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

  async changePassword({ accountId, currentPassword, newPassword }) {
    const parsedAccountId = Number(accountId);
    if (!Number.isInteger(parsedAccountId) || parsedAccountId <= 0) {
      const error = new Error('Invalid account id.');
      error.statusCode = 400;
      throw error;
    }

    const account = await Account.findByPk(parsedAccountId);
    if (!account) {
      const error = new Error('Account not found.');
      error.statusCode = 404;
      throw error;
    }

    if (String(account.senha || '') !== String(currentPassword || '')) {
      const error = new Error('Current password is invalid.');
      error.statusCode = 400;
      throw error;
    }

    if (String(currentPassword || '') === String(newPassword || '')) {
      const error = new Error('New password must be different from current password.');
      error.statusCode = 400;
      throw error;
    }

    account.senha = String(newPassword || '');
    await account.save();

    return { updated: true };
  },
};
