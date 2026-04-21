import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class InitalSchema1776805230130 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'titles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'type',
            type: 'enum',
            enum: ['book', 'periodical', 'other'],
            default: `'book'`,
          },
          { name: 'max_loan_days', type: 'int' },
          { name: 'total_copies', type: 'int', default: '0' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'email', type: 'varchar', length: '255', isUnique: true },
          {
            name: 'registration_number',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          {
            name: 'role',
            type: 'enum',
            enum: ['reader', 'teacher', 'admin'],
            default: `'reader'`,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          { name: 'is_active', type: 'boolean', default: 'true' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'copies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'barcode', type: 'varchar', length: '100', isUnique: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['available', 'loaned', 'reserved', 'lost', 'damaged'],
            default: `'available'`,
          },
          { name: 'title_id', type: 'uuid' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'loans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'copy_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'loaned_at', type: 'timestamp' },
          { name: 'due_date', type: 'timestamp' },
          { name: 'returned_at', type: 'timestamp', isNullable: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'returned', 'overdue', 'lost'],
            default: `'active'`,
          },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'fines',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'loan_id', type: 'uuid', isUnique: true },
          { name: 'amount', type: 'numeric', precision: 10, scale: 2 },
          { name: 'overdue_days', type: 'int' },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'paid', 'waived'],
            default: `'pending'`,
          },
          { name: 'paid_at', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'losses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'copy_id', type: 'uuid', isUnique: true },
          { name: 'user_id', type: 'uuid' },
          { name: 'notes', type: 'text', isNullable: true },
          {
            name: 'replacement_fee',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'resolved'],
            default: `'pending'`,
          },
          { name: 'reported_at', type: 'timestamp' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'title_id', type: 'uuid' },
          {
            name: 'publisher',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'start_date', type: 'date' },
          { name: 'end_date', type: 'date' },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'expired', 'cancelled'],
            default: `'active'`,
          },
          {
            name: 'cost',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'renewal_frequency',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'reserved_titles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'title_id', type: 'uuid' },
          { name: 'teacher_id', type: 'uuid' },
          { name: 'discipline_name', type: 'varchar', length: '255' },
          { name: 'starts_at', type: 'date' },
          { name: 'ends_at', type: 'date' },
          { name: 'in_library_only', type: 'boolean', default: 'true' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      })
    );

    // Indexes
    await queryRunner.createIndex(
      'copies',
      new TableIndex({ name: 'IDX_copies_title_id', columnNames: ['title_id'] })
    );
    await queryRunner.createIndex(
      'copies',
      new TableIndex({ name: 'IDX_copies_status', columnNames: ['status'] })
    );
    await queryRunner.createIndex(
      'loans',
      new TableIndex({ name: 'IDX_loans_user_id', columnNames: ['user_id'] })
    );
    await queryRunner.createIndex(
      'loans',
      new TableIndex({ name: 'IDX_loans_copy_id', columnNames: ['copy_id'] })
    );
    await queryRunner.createIndex(
      'loans',
      new TableIndex({ name: 'IDX_loans_status', columnNames: ['status'] })
    );
    await queryRunner.createIndex(
      'losses',
      new TableIndex({ name: 'IDX_losses_user_id', columnNames: ['user_id'] })
    );
    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_subscriptions_title_id',
        columnNames: ['title_id'],
      })
    );
    await queryRunner.createIndex(
      'reserved_titles',
      new TableIndex({
        name: 'IDX_reserved_titles_title_id',
        columnNames: ['title_id'],
      })
    );
    await queryRunner.createIndex(
      'reserved_titles',
      new TableIndex({
        name: 'IDX_reserved_titles_teacher_id',
        columnNames: ['teacher_id'],
      })
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'copies',
      new TableForeignKey({
        name: 'FK_copies_title',
        columnNames: ['title_id'],
        referencedTableName: 'titles',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'loans',
      new TableForeignKey({
        name: 'FK_loans_copy',
        columnNames: ['copy_id'],
        referencedTableName: 'copies',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'loans',
      new TableForeignKey({
        name: 'FK_loans_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'fines',
      new TableForeignKey({
        name: 'FK_fines_loan',
        columnNames: ['loan_id'],
        referencedTableName: 'loans',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'losses',
      new TableForeignKey({
        name: 'FK_losses_copy',
        columnNames: ['copy_id'],
        referencedTableName: 'copies',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'losses',
      new TableForeignKey({
        name: 'FK_losses_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'subscriptions',
      new TableForeignKey({
        name: 'FK_subscriptions_title',
        columnNames: ['title_id'],
        referencedTableName: 'titles',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'reserved_titles',
      new TableForeignKey({
        name: 'FK_reserved_titles_title',
        columnNames: ['title_id'],
        referencedTableName: 'titles',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      })
    );

    await queryRunner.createForeignKey(
      'reserved_titles',
      new TableForeignKey({
        name: 'FK_reserved_titles_teacher',
        columnNames: ['teacher_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reserved_titles');
    await queryRunner.dropTable('subscriptions');
    await queryRunner.dropTable('losses');
    await queryRunner.dropTable('fines');
    await queryRunner.dropTable('loans');
    await queryRunner.dropTable('copies');
    await queryRunner.dropTable('users');
    await queryRunner.dropTable('titles');
  }
}
