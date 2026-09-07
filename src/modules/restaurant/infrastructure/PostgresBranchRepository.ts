import { Pool } from "pg";
import { dbPool as pool } from "../../../shared/infrastructure/database/pool";
import { Branch } from "../domain/Branch";
import { BranchRepository } from "../domain/RestaurantRepository";

export class PostgresBranchRepository implements BranchRepository {
  async findById(id: string): Promise<Branch | null> {
    const { rows } = await pool.query("SELECT * FROM branches WHERE id = $1", [id]);
    if (!rows[0]) return null;

    return new Branch({
      id: rows[0].id,
      restaurantId: rows[0].restaurant_id,
      name: rows[0].name,
      address: rows[0].address,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at,
    });
  }

  async findByRestaurantId(restaurantId: string): Promise<Branch[]> {
    const query = `
      SELECT id, restaurant_id, name, address, created_at, updated_at
      FROM branches
      WHERE restaurant_id = $1
      ORDER BY name ASC
    `;
    const { rows } = await pool.query(query, [restaurantId]);
    return rows.map(
      (row: any) =>
        new Branch({
          id: row.id,
          restaurantId: row.restaurant_id,
          name: row.name,
          address: row.address,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })
    );
  }

  async save(branch: Branch): Promise<void> {
    const query = `
      UPDATE branches
      SET name = $1, address = $2, updated_at = NOW()
      WHERE id = $3
    `;
    await pool.query(query, [branch.name, branch.address, branch.id]);
  }
}
