import { Loan } from '@modules/loan/infra/typeorm/entities/Loan';
import { Loss } from '@modules/loss/infra/typeorm/entities/Loss';
import { Title } from '@modules/title/infra/typeorm/entities/Title';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum CopyStatus {
  AVAILABLE = 'available',
  LOANED = 'loaned',
  RESERVED = 'reserved',
  LOST = 'lost',
  DAMAGED = 'damaged',
}

@Entity('copies')
export class Copy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'barcode', unique: true })
  barcode: string;

  @Column({
    type: 'enum',
    enum: CopyStatus,
    name: 'status',
    default: CopyStatus.AVAILABLE,
  })
  status: CopyStatus;

  @Column({ type: 'uuid', name: 'title_id' })
  titleId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deletedAt' })
  deletedAt: Date | null;

  @ManyToOne(() => Title, (title) => title.copies, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'title_id' })
  title: Title;

  @OneToMany(() => Loan, (loan) => loan.copy)
  loans: Loan[];

  @OneToOne(() => Loss, (loss) => loss.copy)
  loss: Loss | null;
}
