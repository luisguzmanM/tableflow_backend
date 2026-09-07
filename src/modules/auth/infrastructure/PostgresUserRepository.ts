import { Pool } from "pg";
import { User } from "../domain/User";
import { UserRole } from "../domain/Role";
import { UserRepository } from "../domain/UserRepository";
import { dbPool } from "../../../shared/infrastructure/database/pool";

interface UserRow {
  id: string;
  restaurant_id: string;
  branch_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool = dbPool) {}

  private mapRowToEntity(row: UserRow): User {
    return new User({
      id: row.id,
      restaurantId: row.restaurant_id,
      branchId: row.branch_id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role as UserRole,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, restaurant_id, branch_id, name, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const result = await this.pool.query<UserRow>(query, [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, restaurant_id, branch_id, name, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
    `;
    const result = await this.pool.query<UserRow>(query, [email]);
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async findByBranchId(branchId: string): Promise<User[]> {
    const query = `
      SELECT id, restaurant_id, branch_id, name, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE branch_id = $1
      ORDER BY name ASC
    `;
    const result = await this.pool.query<UserRow>(query, [branchId]);
    return result.rows.map((row) => this.mapRowToEntity(row));
  }

  async save(user: User): Promise<void> {
    const query = `
      INSERT INTO users (id, restaurant_id, branch_id, name, email, password_hash, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        restaurant_id = EXCLUDED.restaurant_id,
        branch_id = EXCLUDED.branch_id,
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        updated_at = NOW()
    `;
    await this.pool.query(query, [
      user.id,
      user.restaurantId,
      user.branchId,
      user.name,
      user.email,
      user.passwordHash,
      user.role,
      user.createdAt,
      user.updatedAt,
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.pool.query("DELETE FROM users WHERE id = $1", [id]);
  }
}
