import { Copy } from '@modules/copy/infra/typeorm/entities/Copy';
import { User } from '@modules/user/infra/typeorm/entities/User';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
export enum LossStatus {
  PENDING = 'pending', // awaiting replacement/payment
  RESOLVED = 'resolved',
}

@Entity('losses')
export class Loss {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'copy_id', unique: true })
  copyId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'text', name: 'notes', nullable: true })
  notes: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'replacement_fee',
    nullable: true,
  })
  replacementFee: number | null;

  @Column({
    type: 'enum',
    enum: LossStatus,
    name: 'status',
    default: LossStatus.PENDING,
  })
  status: LossStatus;

  @Column({ type: 'timestamp', name: 'reported_at' })
  reportedAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deletedAt' })
  deletedAt: Date | null;

  @OneToOne(() => Copy, (copy) => copy.loss, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'copy_id' })
  copy: Copy;

  @ManyToOne(() => User, (user) => user.losses, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
