import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import consultorRoutes from './routes/consultorRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import requestManagementRoutes from './routes/requestManagementRoutes.js';
import serviceLineLeaderRoutes from './routes/serviceLineLeaderRoutes.js';
import talentManagerRoutes from './routes/talentManagerRoutes.js';
import teamRoutes from './routes/teamRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/consultor', consultorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/service-line-leader', serviceLineLeaderRoutes);
app.use('/api/talent-manager', talentManagerRoutes);
app.use('/api/request-management', requestManagementRoutes);
app.use('/api/teams', teamRoutes);

export default app;
