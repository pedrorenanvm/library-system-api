import { Loan } from '@modules/loan/infra/typeorm/entities/Loan';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum FineStatus {
  PENDING = 'pending',
  PAID = 'paid',
  WAIVED = 'waived',
}

@Entity('fines')
export class Fine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'loan_id', unique: true })
  loanId: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'amount' })
  amount: number;

  @Column({ type: 'int', name: 'overdue_days' })
  overdueDays: number;

  @Column({
    type: 'enum',
    enum: FineStatus,
    name: 'status',
    default: FineStatus.PENDING,
  })
  status: FineStatus;

  @Column({ type: 'timestamp', name: 'paid_at', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deletedAt' })
  deletedAt: Date | null;

  @OneToOne(() => Loan, (loan) => loan.fine, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;
}
