import { Pool } from "pg";
import { Table } from "../domain/Table";
import { TableRepository } from "../domain/TableRepository";
import { dbPool } from "../../../shared/infrastructure/database/pool";

interface TableRow {
  id: string;
  branch_id: string;
  number: number;
  seats: number;
  qr_token: string;
  created_at: Date;
  updated_at: Date;
}

export interface TableWithContext {
  table: Table;
  branchName: string;
  restaurantId: string;
  restaurantName: string;
  restaurantTagline: string | null;
}

export class PostgresTableRepository implements TableRepository {
  constructor(private readonly pool: Pool = dbPool) {}

  private mapRowToEntity(row: TableRow): Table {
    return new Table({
      id: row.id,
      branchId: row.branch_id,
      number: row.number,
      seats: row.seats,
      qrToken: row.qr_token,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findById(id: string): Promise<Table | null> {
    const query = `
      SELECT id, branch_id, number, seats, qr_token, created_at, updated_at
      FROM tables
      WHERE id = $1
    `;
    const result = await this.pool.query<TableRow>(query, [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async findByQrToken(qrToken: string): Promise<Table | null> {
    const query = `
      SELECT id, branch_id, number, seats, qr_token, created_at, updated_at
      FROM tables
      WHERE qr_token = $1
    `;
    const result = await this.pool.query<TableRow>(query, [qrToken]);
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async findWithContextByQrToken(qrToken: string): Promise<TableWithContext | null> {
    const query = `
      SELECT 
        t.id AS table_id,
        t.branch_id,
        t.number AS table_number,
        t.seats,
        t.qr_token,
        t.created_at,
        t.updated_at,
        b.name AS branch_name,
        r.id AS restaurant_id,
        r.name AS restaurant_name,
        r.tagline AS restaurant_tagline
      FROM tables t
      JOIN branches b ON t.branch_id = b.id
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE t.qr_token = $1
    `;
    const result = await this.pool.query(query, [qrToken]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    const table = new Table({
      id: row.table_id,
      branchId: row.branch_id,
      number: row.table_number,
      seats: row.seats,
      qrToken: row.qr_token,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });

    return {
      table,
      branchName: row.branch_name,
      restaurantId: row.restaurant_id,
      restaurantName: row.restaurant_name,
      restaurantTagline: row.restaurant_tagline,
    };
  }

  async findByBranchId(branchId: string): Promise<Table[]> {
    const query = `
      SELECT id, branch_id, number, seats, qr_token, created_at, updated_at
      FROM tables
      WHERE branch_id = $1
      ORDER BY number ASC
    `;
    const result = await this.pool.query<TableRow>(query, [branchId]);
    return result.rows.map((row) => this.mapRowToEntity(row));
  }

  async save(table: Table): Promise<void> {
    const query = `
      INSERT INTO tables (id, branch_id, number, seats, qr_token, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        branch_id = EXCLUDED.branch_id,
        number = EXCLUDED.number,
        seats = EXCLUDED.seats,
        qr_token = EXCLUDED.qr_token,
        updated_at = NOW()
    `;
    await this.pool.query(query, [
      table.id,
      table.branchId,
      table.number,
      table.seats,
      table.qrToken,
      table.createdAt,
      table.updatedAt,
    ]);
  }
}
