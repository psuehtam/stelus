import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import cadastrosRoutes from './routes/cadastrosRoutes.js';
import fechamentoRoutes from './routes/fechamentoRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import { errorHandler } from './middlewares/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseOrigins(value) {
  return (value ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();
  const allowedOrigins = parseOrigins(process.env.FRONTEND_URL);

  app.use(
    cors({
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use('/generated', express.static(path.join(__dirname, '../generated')));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'stelus-api' }));

  app.use('/api/auth', authRoutes);
  app.use('/api', cadastrosRoutes);
  app.use('/api/fechamentos', fechamentoRoutes);
  app.use('/api', systemRoutes);

  app.use(errorHandler);
  return app;
}
