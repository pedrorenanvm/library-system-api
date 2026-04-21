import { Copy } from '@modules/copy/infra/typeorm/entities/Copy';
import { Fine } from '@modules/fine/infra/typeorm/entities/Fine';
import { User } from '@modules/user/infra/typeorm/entities/User';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum LoanStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'copy_id' })
  copyId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'timestamp', name: 'loaned_at' })
  loanedAt: Date;

  @Column({ type: 'timestamp', name: 'due_date' })
  dueDate: Date;

  @Column({ type: 'timestamp', name: 'returned_at', nullable: true })
  returnedAt: Date | null;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    name: 'status',
    default: LoanStatus.ACTIVE,
  })
  status: LoanStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deletedAt' })
  deletedAt: Date | null;

  @ManyToOne(() => Copy, (copy) => copy.loans, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'copy_id' })
  copy: Copy;

  @ManyToOne(() => User, (user) => user.loans, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Fine, (fine) => fine.loan)
  fine: Fine | null;
}
