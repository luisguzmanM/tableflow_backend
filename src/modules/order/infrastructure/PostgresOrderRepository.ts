import { Pool } from "pg";
import { Order } from "../domain/Order";
import { OrderItem } from "../domain/OrderItem";
import { SelectedModifier } from "../domain/SelectedModifier";
import { OrderStatus } from "../domain/OrderStatus";
import { OrderRepository } from "../domain/OrderRepository";
import { dbPool } from "../../../shared/infrastructure/database/pool";
import { randomUUID } from "crypto";

export interface OrderWithTableContext {
  order: Order;
  tableNumber: number;
  tableName?: string;
  branchId: string;
}

export class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly pool: Pool = dbPool) {}

  async save(order: Order): Promise<string> {
    const client = await this.pool.connect();
    const orderId = order.id || randomUUID();

    try {
      await client.query("BEGIN");

      // 1. Insert order
      await client.query(
        `INSERT INTO orders (id, table_id, status, payment_status, payment_method, paid_at, paid_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           payment_status = EXCLUDED.payment_status,
           payment_method = EXCLUDED.payment_method,
           paid_at = EXCLUDED.paid_at,
           paid_by = EXCLUDED.paid_by,
           updated_at = NOW()`,
        [orderId, order.tableId, order.status, order.paymentStatus, order.paymentMethod, order.paidAt, order.paidBy, order.createdAt, order.updatedAt]
      );

      // 2. Insert items and modifiers
      for (const item of order.items) {
        const itemId = item.id || randomUUID();

        await client.query(
          `INSERT INTO order_items (id, order_id, menu_item_id, product_name, unit_price, quantity, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [
            itemId,
            orderId,
            item.menuItemId,
            item.productName,
            item.unitPrice,
            item.quantity,
            item.createdAt,
          ]
        );

        for (const mod of item.selectedModifiers) {
          const modId = mod.id || randomUUID();
          await client.query(
            `INSERT INTO selected_modifiers (id, order_item_id, modifier_id, modifier_name, price)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO NOTHING`,
            [modId, itemId, mod.modifierId, mod.modifierName, mod.price]
          );
        }
      }

      await client.query("COMMIT");
      return orderId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Order | null> {
    const orderRes = await this.pool.query(
      `SELECT id, table_id, status, payment_status, payment_method, paid_at, paid_by, created_at, updated_at FROM orders WHERE id = $1`,
      [id]
    );
    if (orderRes.rows.length === 0) return null;

    const orderRow = orderRes.rows[0];

    // Query items
    const itemRes = await this.pool.query(
      `SELECT id, order_id, menu_item_id, product_name, unit_price, quantity, created_at
       FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    // Query modifiers for these items
    const itemIds = itemRes.rows.map((r) => r.id);
    const modRes = itemIds.length > 0
      ? await this.pool.query(
          `SELECT id, order_item_id, modifier_id, modifier_name, price 
           FROM selected_modifiers WHERE order_item_id = ANY($1::uuid[])`,
          [itemIds]
        )
      : { rows: [] };

    const modifiersByItemId = new Map<string, SelectedModifier[]>();
    for (const m of modRes.rows) {
      const mod = new SelectedModifier({
        id: m.id,
        modifierId: m.modifier_id,
        modifierName: m.modifier_name,
        price: parseFloat(m.price),
      });
      const list = modifiersByItemId.get(m.order_item_id) || [];
      list.push(mod);
      modifiersByItemId.set(m.order_item_id, list);
    }

    const items: OrderItem[] = itemRes.rows.map((i) => {
      return new OrderItem({
        id: i.id,
        orderId: i.order_id,
        menuItemId: i.menu_item_id,
        productName: i.product_name,
        unitPrice: parseFloat(i.unit_price),
        quantity: i.quantity,
        selectedModifiers: modifiersByItemId.get(i.id) || [],
        createdAt: i.created_at,
      });
    });

    return new Order({
      id: orderRow.id,
      tableId: orderRow.table_id,
      status: orderRow.status as OrderStatus,
      paymentStatus: orderRow.payment_status as any,
      paymentMethod: orderRow.payment_method as any,
      paidAt: orderRow.paid_at,
      paidBy: orderRow.paid_by,
      items,
      createdAt: orderRow.created_at,
      updatedAt: orderRow.updated_at,
    });
  }

  async findByTableId(tableId: string): Promise<Order[]> {
    const orderRes = await this.pool.query(
      `SELECT id FROM orders WHERE table_id = $1 ORDER BY created_at DESC`,
      [tableId]
    );

    const orders: Order[] = [];
    for (const row of orderRes.rows) {
      const order = await this.findById(row.id);
      if (order) orders.push(order);
    }
    return orders;
  }

  async findByBranchAndStatus(
    branchId: string,
    statuses?: OrderStatus[]
  ): Promise<Order[]> {
    const contextual = await this.findWithContextByBranchAndStatus(branchId, statuses);
    return contextual.map((c) => c.order);
  }

  async findWithContextByBranchAndStatus(
    branchId: string,
    statuses?: OrderStatus[]
  ): Promise<OrderWithTableContext[]> {
    let query = `
      SELECT o.id, t.number AS table_number, t.branch_id
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      WHERE t.branch_id = $1
    `;
    const params: any[] = [branchId];

    if (statuses && statuses.length > 0) {
      params.push(statuses);
      query += ` AND o.status = ANY($2::varchar[])`;
    }

    query += ` ORDER BY o.created_at ASC`;

    const res = await this.pool.query(query, params);
    const results: OrderWithTableContext[] = [];

    for (const row of res.rows) {
      const order = await this.findById(row.id);
      if (order) {
        results.push({
          order,
          tableNumber: row.table_number,
          branchId: row.branch_id,
        });
      }
    }

    return results;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    await this.pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );
  }
}
