import { User, UserRole } from '@modules/user/infra/typeorm/entities/User';
import { AppDataSource } from '@shared/infra/typeorm/dataSource';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  const userRepository = AppDataSource.getRepository(User);

  const userExists = await userRepository.findOne({
    where: { email: 'admin@gmail.com' },
  });

  if (!userExists) {
    const hashedPassword = await bcrypt.hash(
      '12345678' + process.env.PEPPER,
      12
    );

    const user = userRepository.create({
      name: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      registrationNumber: '20260101',
      createdAt: new Date(),
    });

    await userRepository.save(user);
    console.log('Usuário admin criado.');
  }
}

export default createAdminUser;
