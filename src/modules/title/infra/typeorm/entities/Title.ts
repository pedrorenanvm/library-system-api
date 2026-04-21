import { Copy } from '@modules/copy/infra/typeorm/entities/Copy';
import { ReservedTitle } from '@modules/reservedTitle/infra/typeorm/entities/ReservedTitle';
import { Subscription } from '@modules/subscription/infra/typeorm/entities/Subscription';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum TitleType {
  BOOK = 'book',
  PERIODICAL = 'periodical',
  OTHER = 'other',
}

@Entity('titles')
export class Title {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: TitleType,
    name: 'type',
    default: TitleType.BOOK,
  })
  type: TitleType;

  @Column({ type: 'int', name: 'max_loan_days' })
  maxLoanDays: number;

  @Column({ type: 'int', name: 'total_copies', default: 0 })
  totalCopies: number;

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deletedAt' })
  deletedAt: Date | null;

  @OneToMany(() => Copy, (copy) => copy.title)
  copies: Copy[];

  @OneToMany(() => Subscription, (subscription) => subscription.title)
  subscriptions: Subscription[];

  @OneToMany(() => ReservedTitle, (reservedTitle) => reservedTitle.title)
  reservations: ReservedTitle[];
}
