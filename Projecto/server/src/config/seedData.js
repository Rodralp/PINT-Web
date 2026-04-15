import { Account } from '../models/sql/Account.js';
import { Reminder } from '../models/sql/Reminder.js';

const defaultAccounts = [
  {
    nome: 'Joao Gomes',
    email: 'joaogomes1234@softinsa.pt',
    senha: '12345678',
    role: 'consultor',
    status: 'ativo',
  },
  {
    nome: 'Maria Santos',
    email: 'maria.santos@softinsa.pt',
    senha: '12345678',
    role: 'talent-manager',
    status: 'ativo',
  },
  {
    nome: 'Pedro Mendes',
    email: 'pedro.mendes@softinsa.pt',
    senha: '12345678',
    role: 'service-line-leader',
    status: 'ativo',
  },
  {
    nome: 'Ana Costa',
    email: 'ana.costa@softinsa.pt',
    senha: '12345678',
    role: 'admin-gestor',
    status: 'ativo',
  },
];

const defaultReminders = [
  {
    title: 'Conferir requisitos enviados.',
    description: 'Rever todos os requisitos do novo projeto',
    date: '2025-12-07',
    color: 'green',
  },
  {
    title: 'Badge C++ Mastery expira em 30 dias.',
    description: 'Renovar certificacao antes do prazo',
    date: '2025-11-29',
    color: 'yellow',
  },
  {
    title: 'Meta de 15 badges ate ao fim do mes.',
    description: 'Completar badges restantes para atingir a meta',
    date: '2025-11-27',
    color: 'blue',
  },
  {
    title: 'Reuniao de equipa trimestral.',
    description: 'Preparar apresentacao dos resultados',
    date: '2026-01-15',
    color: 'purple',
  },
];

export const seedDatabase = async () => {
  const [accountsCount, remindersCount] = await Promise.all([Account.count(), Reminder.count()]);

  if (accountsCount === 0) {
    await Account.bulkCreate(defaultAccounts);
  }

  if (remindersCount === 0) {
    await Reminder.bulkCreate(defaultReminders);
  }
};