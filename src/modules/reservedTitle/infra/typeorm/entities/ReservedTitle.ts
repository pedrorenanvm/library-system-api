import { Title } from '@modules/title/infra/typeorm/entities/Title';
import { User } from '@modules/user/infra/typeorm/entities/User';
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
@Entity('reserved_titles')
export class ReservedTitle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'title_id' })
  titleId: string;

  @Column({ type: 'uuid', name: 'teacher_id' })
  teacherId: string;

  @Column({ type: 'varchar', length: 255, name: 'discipline_name' })
  disciplineName: string;

  @Column({ type: 'date', name: 'starts_at' })
  startsAt: Date;

  @Column({ type: 'date', name: 'ends_at' })
  endsAt: Date;

  @Column({ type: 'boolean', name: 'in_library_only', default: true })
  inLibraryOnly: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deletedAt' })
  deletedAt: Date | null;

  @ManyToOne(() => Title, (title) => title.reservations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'title_id' })
  title: Title;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;
}
