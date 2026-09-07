import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import { PostgresTableRepository } from "../../src/modules/restaurant/infrastructure/PostgresTableRepository";
import { PostgresMenuRepository } from "../../src/modules/menu/infrastructure/PostgresMenuRepository";
import { PostgresOrderRepository } from "../../src/modules/order/infrastructure/PostgresOrderRepository";
import { Table } from "../../src/modules/restaurant/domain/Table";
import { MenuItem } from "../../src/modules/menu/domain/MenuItem";
import { Order } from "../../src/modules/order/domain/Order";
import { OrderItem } from "../../src/modules/order/domain/OrderItem";
import { JwtTokenService } from "../../src/modules/auth/infrastructure/JwtTokenService";

describe("Order API Integration", () => {
  const tokenService = new JwtTokenService();

  const kitchenToken = tokenService.sign({
    userId: "usr-kitchen",
    restaurantId: "rest-1",
    branchId: "branch-1",
    role: "KITCHEN",
    email: "kitchen@oliveandember.com",
  });

  const mockTable = new Table({
    id: "table-1",
    branchId: "branch-1",
    number: 7,
    qrToken: "tbl_tok_007",
  });

  const mockPizza = new MenuItem({
    id: "item-pizza",
    categoryId: "cat-pizza",
    name: "Margherita",
    price: 11.0,
    available: true,
  });

  const mockOrder = new Order({
    id: "order-999",
    tableId: "table-1",
    status: "PENDING",
    items: [
      new OrderItem({
        id: "oi-1",
        orderId: "order-999",
        menuItemId: "item-pizza",
        productName: "Margherita",
        unitPrice: 11.0,
        quantity: 2,
      }),
    ],
  });

  it("should create order via public POST /api/orders", async () => {
    vi.spyOn(PostgresTableRepository.prototype, "findByQrToken").mockResolvedValue(mockTable);
    vi.spyOn(PostgresMenuRepository.prototype, "findMenuItemById").mockResolvedValue(mockPizza);
    vi.spyOn(PostgresOrderRepository.prototype, "save").mockResolvedValue("order-999");

    const app = createApp();
    const response = await request(app)
      .post("/api/orders")
      .send({
        qrToken: "tbl_tok_007",
        items: [{ menuItemId: "item-pizza", quantity: 2 }],
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe("order-999");
    expect(response.body.total).toBe(22.0);
    expect(response.body.status).toBe("PENDING");
  });

  it("should query order details via public GET /api/orders/:id", async () => {
    vi.spyOn(PostgresOrderRepository.prototype, "findById").mockResolvedValue(mockOrder);

    const app = createApp();
    const response = await request(app).get("/api/orders/order-999");

    expect(response.status).toBe(200);
    expect(response.body.order.id).toBe("order-999");
    expect(response.body.order.total).toBe(22.0);
    expect(response.body.order.items[0].productName).toBe("Margherita");
  });

  it("should update order status via authenticated PATCH /api/orders/:id/status", async () => {
    vi.spyOn(PostgresOrderRepository.prototype, "findById").mockResolvedValue(mockOrder);
    vi.spyOn(PostgresOrderRepository.prototype, "updateStatus").mockResolvedValue();

    const app = createApp();
    const response = await request(app)
      .patch("/api/orders/order-999/status")
      .set("Authorization", `Bearer ${kitchenToken}`)
      .send({ status: "PREPARING" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("PREPARING");
  });
});
