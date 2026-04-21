import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

import { DataSource } from 'typeorm';
const isProduction = process.env.NODE_ENV === 'production';
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT_INTERN || '5432 ', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [
    isProduction
      ? 'dist/modules/**/infra/typeorm/entities/*.js'
      : 'src/modules/**/infra/typeorm/entities/*.ts',
  ],
  migrations: [
    isProduction
      ? 'dist/shared/infra/typeorm/migrations/*.js'
      : 'src/shared/infra/typeorm/migrations/*.ts',
  ],
});
