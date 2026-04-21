import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import './database';
import routes from './routes/main.routes';
import '@shared/container';
import { globalErrorHandler } from '@shared/errors/GlobalErrorHandler';
import initializeDatabase from '@shared/infra/http/database/index';
import cookieParser from 'cookie-parser';

const app = express();
const corsOptions = {
  origin: ['http://localhost:4200', 'https://seu-dominio.com'],
  credentials: true,
};

app.set('trust proxy', true);

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(routes);
app.use(globalErrorHandler);

const port = process.env.PORT || 3000;
console.log(`Servidor rodando na porta ${port}`);

async function bootstrap() {
  try {
    await initializeDatabase();
    app.listen(port, () => {});
  } catch (error) {
    console.error('Erro ao iniciar aplicação:', error);
    process.exit(1);
  }
}

bootstrap();

export default app;
