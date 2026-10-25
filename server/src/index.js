import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import assetRoutes from './routes/assets.js';
import inventoryRoutes from './routes/inventory.js';
import workOrderRoutes from './routes/workorders.js';
import dashboardRoutes from './routes/dashboard.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || '').split(',') }));
app.use(express.json({ limit: '1mb' }));

// Protege login/cadastro contra forca bruta
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' } });
app.use(['/api/auth/login', '/api/auth/register'], authLimiter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api', dashboardRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

// Express 5 encaminha rejeicoes de handlers async para este middleware automaticamente
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => console.log(`ANDALORE API em http://localhost:${port}`));
}
process.on('unhandledRejection', (e) => console.error('unhandledRejection', e));
