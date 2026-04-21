import { Loan } from '@modules/loan/infra/typeorm/entities/Loan';
import { Loss } from '@modules/loss/infra/typeorm/entities/Loss';
import { ReservedTitle } from '@modules/reservedTitle/infra/typeorm/entities/ReservedTitle';
import { Exclude } from 'class-transformer';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum UserRole {
  READER = 'reader',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 255, name: 'email', unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, name: 'password', nullable: false })
  password: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'registration_number',
    unique: true,
  })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 20, name: 'phone', nullable: true })
  phone: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    name: 'role',
    default: UserRole.READER,
  })
  role: UserRole;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deletedAt' })
  deletedAt: Date | null;

  @OneToMany(() => Loan, (loan) => loan.user)
  loans: Loan[];

  @OneToMany(() => Loss, (loss) => loss.user)
  losses: Loss[];

  @OneToMany(() => ReservedTitle, (reservedTitle) => reservedTitle.teacher)
  reservations: ReservedTitle[];
}
