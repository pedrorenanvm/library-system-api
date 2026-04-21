import * as dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});
import { AppDataSource } from '@shared/infra/typeorm/dataSource';
import createAdminUser from '../middlewares/createUsersForDevelopers';

async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('📦 Conexão com o banco de dados estabelecida com sucesso!');
    if (process.env.NODE_ENV === 'development') {
      await createAdminUser();
    }
  } catch (error) {
    console.log('Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
}

export default initializeDatabase;
