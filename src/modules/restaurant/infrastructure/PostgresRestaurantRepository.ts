import { Pool } from "pg";
import { dbPool as pool } from "../../../shared/infrastructure/database/pool";
import { Restaurant } from "../domain/Restaurant";
import { RestaurantRepository } from "../domain/RestaurantRepository";

export class PostgresRestaurantRepository implements RestaurantRepository {
  async findById(id: string): Promise<Restaurant | null> {
    const query = `
      SELECT id, name, tagline, currency, service_hours, accept_orders, ask_tip, created_at, updated_at
      FROM restaurants
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;

    const row = rows[0];
    return new Restaurant({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      currency: row.currency,
      serviceHours: row.service_hours,
      acceptOrders: row.accept_orders,
      askTip: row.ask_tip,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async save(restaurant: Restaurant): Promise<void> {
    const query = `
      UPDATE restaurants
      SET name = $1, tagline = $2, currency = $3, service_hours = $4, accept_orders = $5, ask_tip = $6, updated_at = NOW()
      WHERE id = $7
    `;
    await pool.query(query, [
      restaurant.name,
      restaurant.tagline,
      restaurant.currency,
      restaurant.serviceHours,
      restaurant.acceptOrders,
      restaurant.askTip,
      restaurant.id,
    ]);
  }
}
