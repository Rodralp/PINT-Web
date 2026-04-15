import { Account } from './sql/Account.js';

const sanitizeAccount = (account) => ({
  id: account.id,
  nome: account.nome,
  email: account.email,
  role: account.role,
  status: account.status,
});

const normalizeEmail = (value) => value.trim().toLowerCase();

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

    return account ? sanitizeAccount(account) : null;
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
