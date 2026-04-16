import { Reminder } from './sql/Reminder.js';
import { sequelize } from '../config/database.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

const catalogBadges = [
  {
    id: 'lowcode-junior',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_junior',
    points: 100,
    badgeImage: '/badges/J%C3%BAnior.png',
    date: '12 Jan 2026',
  },
  {
    id: 'lowcode-intermediate',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '12 Jan 2026',
  },
  {
    id: 'lowcode-senior',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '12 Jan 2026',
  },
  {
    id: 'lowcode-specialist',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '12 Jan 2026',
  },
  {
    id: 'lowcode-knowledge-lead',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_knowledge_lead',
    points: 300,
    badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-junior',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_junior',
    points: 100,
    badgeImage: '/badges/J%C3%BAnior.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-intermediate',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-senior',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-specialist',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '12 Jan 2026',
  },
  {
    id: 'cloud-knowledge-lead',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_knowledge_lead',
    points: 300,
    badgeImage: '/badges/L%C3%ADder%20de%20Conhecimento.png',
    date: '12 Jan 2026',
  },
];

const myBadges = [
  {
    id: 'my-1',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '12 Jan 2026',
    stateId: 'aprovado',
  },
  {
    id: 'my-2',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '11 Jan 2026',
    stateId: 'em_validacao',
  },
  {
    id: 'my-3',
    area: 'LowCode (Outsystems)',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '10 Jan 2026',
    stateId: 'candidatura_em_progresso',
  },
  {
    id: 'my-4',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_specialist',
    points: 250,
    badgeImage: '/badges/Especialista.png',
    date: '09 Jan 2026',
    stateId: 'rejeitado',
  },
  {
    id: 'my-5',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_senior',
    points: 200,
    badgeImage: '/badges/S%C3%A9nior.png',
    date: '08 Jan 2026',
    stateId: 'aprovado',
  },
  {
    id: 'my-6',
    area: 'Cloud Architecture',
    levelKey: 'badge_level_intermediate',
    points: 150,
    badgeImage: '/badges/Interm%C3%A9dio.png',
    date: '07 Jan 2026',
    stateId: 'em_validacao',
  },
];

const myRequests = [
  { id: 1, badge: 'UX/UI Design', level: 'Especialista', date: '05/12/2025', status: 'pendente' },
  { id: 2, badge: 'Data Analytics', level: 'Intermedio', date: '04/12/2025', status: 'rejeitado' },
  { id: 3, badge: 'Cloud Architecture', level: 'Senior', date: '03/12/2025', status: 'aprovado' },
  { id: 4, badge: 'LowCode (Outsystems)', level: 'Junior', date: '01/12/2025', status: 'pendente' },
  { id: 5, badge: 'DevOps', level: 'Intermedio', date: '30/11/2025', status: 'pendente' },
  { id: 6, badge: 'Cybersecurity', level: 'Lider de Conhecimento', date: '28/11/2025', status: 'aprovado' },
  { id: 7, badge: 'Machine Learning', level: 'Senior', date: '25/11/2025', status: 'aprovado' },
  { id: 8, badge: 'Mobile Development', level: 'Junior', date: '22/11/2025', status: 'rejeitado' },
  { id: 9, badge: 'Blockchain', level: 'Especialista', date: '20/11/2025', status: 'aprovado' },
  { id: 10, badge: 'IoT Solutions', level: 'Intermedio', date: '18/11/2025', status: 'pendente' },
];

const rankingConsultores = [
  { id: 1, name: 'Joao Gomes', email: 'joaogomes1234@softinsa.pt', points: 2450, badges: 12, serviceLine: 'Cloud', avatar: 'https://i.pravatar.cc/120?u=joao.gomes' },
  { id: 2, name: 'Maria Santos', email: 'maria.santos@softinsa.pt', points: 2200, badges: 10, serviceLine: 'Data & AI', avatar: 'https://i.pravatar.cc/120?u=maria.santos' },
  { id: 3, name: 'Pedro Mendes', email: 'pedro.mendes@softinsa.pt', points: 1950, badges: 9, serviceLine: 'Cloud', avatar: 'https://i.pravatar.cc/120?u=pedro.mendes' },
  { id: 4, name: 'Ana Costa', email: 'ana.costa@softinsa.pt', points: 1700, badges: 8, serviceLine: 'LowCode', avatar: 'https://i.pravatar.cc/120?u=ana.costa' },
  { id: 5, name: 'Carlos Ferreira', email: 'carlos.ferreira@softinsa.pt', points: 1500, badges: 7, serviceLine: 'Cybersecurity', avatar: 'https://i.pravatar.cc/120?u=carlos.ferreira' },
  { id: 6, name: 'Rita Oliveira', email: 'rita.oliveira@softinsa.pt', points: 1450, badges: 7, serviceLine: 'Data & AI', avatar: 'https://i.pravatar.cc/120?u=rita.oliveira' },
  { id: 7, name: 'Bruno Alves', email: 'bruno.alves@softinsa.pt', points: 1350, badges: 7, serviceLine: 'Cloud', avatar: 'https://i.pravatar.cc/120?u=bruno.alves' },
  { id: 8, name: 'Sofia Rodrigues', email: 'sofia.rodrigues@softinsa.pt', points: 1250, badges: 7, serviceLine: 'LowCode', avatar: 'https://i.pravatar.cc/120?u=sofia.rodrigues' },
  { id: 9, name: 'Giorgian Arrascarta', email: 'giorgian.arrascarta@softinsa.pt', points: 1250, badges: 6, serviceLine: 'Cybersecurity', avatar: 'https://i.pravatar.cc/120?u=giorgian.arrascarta' },
  { id: 10, name: 'Ana Clara', email: 'ana.clara@softinsa.pt', points: 1200, badges: 6, serviceLine: 'Data & AI', avatar: 'https://i.pravatar.cc/120?u=ana.clara' },
  { id: 11, name: 'Omar Rocha', email: 'omar.rocha@softinsa.pt', points: 1200, badges: 5, serviceLine: 'Cloud', avatar: 'https://i.pravatar.cc/120?u=omar.rocha' },
  { id: 12, name: 'Raquel Ribeiro', email: 'raquel.ribeiro@softinsa.pt', points: 1200, badges: 5, serviceLine: 'LowCode', avatar: 'https://i.pravatar.cc/120?u=raquel.ribeiro' },
];

const profileData = {
  location: 'Portugal',
  joined: '2023',
  timelineValues: [3, 2, 5, 4, 6, 3, 7, 5, 8, 4, 6, 9],
  stats: [
    {
      titleKey: 'dashboard_stat_badges_title',
      value: '12',
      noteKey: 'dashboard_stat_badges_note',
      iconKey: 'award',
      tone: 'gold',
    },
    {
      titleKey: 'dashboard_stat_streak_title',
      value: '4',
      noteKey: 'dashboard_stat_streak_note',
      iconKey: 'flame',
      tone: 'fire',
    },
    {
      titleKey: 'dashboard_stat_requests_title',
      value: '5',
      noteKey: 'dashboard_stat_requests_note',
      iconKey: 'clock',
      tone: 'blue',
    },
    {
      titleKey: 'dashboard_stat_ranking_title',
      value: '#15',
      noteKey: 'dashboard_stat_ranking_note',
      iconKey: 'crown',
      tone: 'rank',
    },
  ],
  skillsItems: [
    { title: 'LowCode (Outsystems)', subtitleKey: 'badge_level_specialist', accent: 'warning' },
    { title: 'JavaScript', subtitleKey: 'badge_level_senior', accent: 'yellow' },
    { title: 'React', subtitleKey: 'badge_level_intermediate', accent: 'info' },
  ],
  certificationsItems: [
    { title: 'LowCode (Outsystems)', subtitleKey: 'badge_level_knowledge_lead', accent: 'success' },
    { title: 'Cloud Architecture', subtitleKey: 'badge_level_specialist', accent: 'violet' },
    { title: 'C++ Mastery', subtitleKey: 'badge_level_senior', accent: 'amber' },
  ],
};

const mapReminder = (reminder) => ({
  id: reminder.id,
  accountId: reminder.accountId,
  title: reminder.title,
  description: reminder.description,
  date: reminder.date,
  color: reminder.color,
});

const getNextReminderId = async () => {
  const maxId = Number(await Reminder.max('id')) || 0;
  return maxId + 1;
};

const syncReminderIdSequence = async (lastId) => {
  const safeLastId = Number(lastId) > 0 ? Number(lastId) : 1;
  const isCalled = Number(lastId) > 0;

  await sequelize.query(
    "SELECT setval(pg_get_serial_sequence('reminders', 'id'), :safeLastId, :isCalled)",
    {
      replacements: { safeLastId, isCalled },
    },
  );
};

export const consultorModel = {
  getCatalogBadges() {
    return clone(catalogBadges);
  },

  getMyBadges() {
    return clone(myBadges);
  },

  getMyRequests() {
    return clone(myRequests);
  },

  getRankingConsultores() {
    return clone(rankingConsultores);
  },

  async getReminders(accountId) {
    const reminders = await Reminder.findAll({
      where: { accountId: Number(accountId) },
      order: [['createdAt', 'DESC']],
    });

    return reminders.map(mapReminder);
  },

  async createReminder(accountId, payload) {
    const nextReminderId = await getNextReminderId();

    const reminder = await Reminder.create({
      id: nextReminderId,
      accountId: Number(accountId),
      title: payload.title.trim(),
      description: payload.description.trim(),
      date: payload.date,
      color: payload.color,
    });

    await syncReminderIdSequence(nextReminderId);

    return mapReminder(reminder);
  },

  async updateReminder(id, accountId, payload) {
    const reminder = await Reminder.findOne({ where: { id: Number(id), accountId: Number(accountId) } });
    if (!reminder) {
      return null;
    }

    await reminder.update({
      title: payload.title.trim(),
      description: payload.description.trim(),
      date: payload.date,
      color: payload.color,
    });

    return mapReminder(reminder);
  },

  async deleteReminder(id, accountId) {
    const deletedRows = await Reminder.destroy({ where: { id: Number(id), accountId: Number(accountId) } });
    return deletedRows > 0;
  },

  getProfileData() {
    return clone(profileData);
  },
};
