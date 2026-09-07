import { Pool } from "pg";
import { dbPool as pool } from "../../../shared/infrastructure/database/pool";
import { AccountRegistrar, AccountRegistrationData } from "../domain/AccountRegistrar";
import { User } from "../domain/User";

export class PostgresAccountRegistrar implements AccountRegistrar {
  async registerAccount(data: AccountRegistrationData): Promise<User> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Create Restaurant
      const restaurantRes = await client.query(
        `INSERT INTO restaurants (name) VALUES ($1) RETURNING id`,
        [data.restaurantName]
      );
      const restaurantId = restaurantRes.rows[0].id;

      // 2. Create default Branch
      const branchRes = await client.query(
        `INSERT INTO branches (restaurant_id, name) VALUES ($1, $2) RETURNING id`,
        [restaurantId, "Principal"]
      );
      const branchId = branchRes.rows[0].id;

      // 3. Create default Menu
      await client.query(
        `INSERT INTO menus (restaurant_id) VALUES ($1)`,
        [restaurantId]
      );

      // 4. Create ADMIN User
      const userRes = await client.query(
        `INSERT INTO users (restaurant_id, branch_id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, created_at, updated_at`,
        [restaurantId, branchId, data.adminName, data.adminEmail.toLowerCase(), data.adminPasswordHash, "ADMIN"]
      );

      await client.query("COMMIT");

      const userRow = userRes.rows[0];

      return new User({
        id: userRow.id,
        restaurantId,
        branchId,
        name: data.adminName,
        email: data.adminEmail,
        passwordHash: data.adminPasswordHash,
        role: "ADMIN",
        createdAt: userRow.created_at,
        updatedAt: userRow.updated_at,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
