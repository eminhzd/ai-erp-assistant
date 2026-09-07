#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0dc7353e539a0d3f32952224602ee003d68b1a94fb00bde902247b8972556fba/contract';
import startContract from '../../snapshots/0dc7353e539a0d3f32952224602ee003d68b1a94fb00bde902247b8972556fba/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d5d88b9aa7d78cf03841e07c09c5425b1fe383f35b18f5b2019dbb6b140343b7/contract';
import endContract from '../../snapshots/d5d88b9aa7d78cf03841e07c09c5425b1fe383f35b18f5b2019dbb6b140343b7/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('companyId', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
          col('email', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'SERIAL', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'users',
        index: 'users_companyId_idx_33acc5ed',
        columns: ['companyId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'users',
        foreignKey: {
          name: 'users_companyId_fkey',
          columns: ['companyId'],
          references: { schema: 'public', table: 'company', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
