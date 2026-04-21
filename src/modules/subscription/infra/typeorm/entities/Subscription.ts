import { Title } from '@modules/title/infra/typeorm/entities/Title';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'title_id' })
  titleId: string;

  @Column({ type: 'varchar', length: 255, name: 'publisher', nullable: true })
  publisher: string | null;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    name: 'status',
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'cost',
    nullable: true,
  })
  cost: number | null;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'renewal_frequency',
    nullable: true,
  })
  renewalFrequency: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deletedAt' })
  deletedAt: Date | null;
  @ManyToOne(() => Title, (title) => title.subscriptions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'title_id' })
  title: Title;
}
