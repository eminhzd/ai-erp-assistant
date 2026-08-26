#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1949ef7e5e99ed6dcb8154d01e9480b7c9cedcf96a3f75685a4f79b0610efea6/contract';
import startContract from '../../snapshots/1949ef7e5e99ed6dcb8154d01e9480b7c9cedcf96a3f75685a4f79b0610efea6/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/2bbbc256029c91edbf064bf33cf41e5f201ecbeee1bc5b3861d203a1d2f179b1/contract';
import endContract from '../../snapshots/2bbbc256029c91edbf064bf33cf41e5f201ecbeee1bc5b3861d203a1d2f179b1/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'warehouseStock',
        constraint: 'warehouseStock_warehouseId_productId_key',
      }),
      this.addUnique({
        schema: 'public',
        table: 'warehouseStock',
        constraint: 'warehouseStock_companyId_warehouseId_productId_key',
        columns: ['companyId', 'warehouseId', 'productId'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
