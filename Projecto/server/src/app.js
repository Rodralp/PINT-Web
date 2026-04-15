import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import consultorRoutes from './routes/consultorRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/consultor', consultorRoutes);

export default app;
