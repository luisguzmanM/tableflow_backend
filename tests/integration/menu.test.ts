import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import { PostgresTableRepository } from "../../src/modules/restaurant/infrastructure/PostgresTableRepository";
import { PostgresMenuRepository } from "../../src/modules/menu/infrastructure/PostgresMenuRepository";
import { Table } from "../../src/modules/restaurant/domain/Table";
import { Menu } from "../../src/modules/menu/domain/Menu";
import { Category } from "../../src/modules/menu/domain/Category";
import { MenuItem } from "../../src/modules/menu/domain/MenuItem";
import { JwtTokenService } from "../../src/modules/auth/infrastructure/JwtTokenService";

describe("Menu & Table API Integration", () => {
  const tokenService = new JwtTokenService();

  const adminToken = tokenService.sign({
    userId: "usr-admin",
    restaurantId: "rest-1",
    branchId: "branch-1",
    role: "ADMIN",
    email: "admin@oliveandember.com",
  });

  const waiterToken = tokenService.sign({
    userId: "usr-waiter",
    restaurantId: "rest-1",
    branchId: "branch-1",
    role: "WAITER",
    email: "waiter@oliveandember.com",
  });

  const mockTable = new Table({
    id: "table-1",
    branchId: "branch-1",
    number: 7,
    seats: 4,
    qrToken: "tbl_tok_007",
  });

  const mockCategory = new Category({
    id: "cat-1",
    menuId: "menu-1",
    name: "Hamburguesas",
    position: 1,
    items: [
      new MenuItem({
        id: "item-1",
        categoryId: "cat-1",
        name: "Hamburguesa Clásica",
        price: 12.5,
        available: true,
      }),
    ],
  });

  const mockMenu = new Menu({
    id: "menu-1",
    restaurantId: "rest-1",
    categories: [mockCategory],
  });

  it("should allow public menu retrieval with valid QR token", async () => {
    vi.spyOn(PostgresTableRepository.prototype, "findWithContextByQrToken").mockResolvedValue({
      table: mockTable,
      branchName: "Downtown Central",
      restaurantId: "rest-1",
      restaurantName: "Olive & Ember",
    });

    vi.spyOn(PostgresMenuRepository.prototype, "findByRestaurantId").mockResolvedValue(mockMenu);

    const app = createApp();
    const response = await request(app).get("/api/menu/public/tbl_tok_007");

    expect(response.status).toBe(200);
    expect(response.body.restaurant.name).toBe("Olive & Ember");
    expect(response.body.table.number).toBe(7);
    expect(response.body.menu.categories).toHaveLength(1);
    expect(response.body.menu.categories[0].items[0].name).toBe("Hamburguesa Clásica");
  });

  it("should allow public table context retrieval by QR token", async () => {
    vi.spyOn(PostgresTableRepository.prototype, "findWithContextByQrToken").mockResolvedValue({
      table: mockTable,
      branchName: "Downtown Central",
      restaurantId: "rest-1",
      restaurantName: "Olive & Ember",
    });

    const app = createApp();
    const response = await request(app).get("/api/tables/qr/tbl_tok_007");

    expect(response.status).toBe(200);
    expect(response.body.number).toBe(7);
    expect(response.body.restaurant.name).toBe("Olive & Ember");
  });

  it("should allow ADMIN to create category", async () => {
    vi.spyOn(PostgresMenuRepository.prototype, "findByRestaurantId").mockResolvedValue(mockMenu);
    vi.spyOn(PostgresMenuRepository.prototype, "saveCategory").mockResolvedValue();

    const app = createApp();
    const response = await request(app)
      .post("/api/menu/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Postres" });

    expect(response.status).toBe(201);
    expect(response.body.category.name).toBe("Postres");
  });

  it("should reject category creation from non-admin employee", async () => {
    const app = createApp();
    const response = await request(app)
      .post("/api/menu/categories")
      .set("Authorization", `Bearer ${waiterToken}`)
      .send({ name: "Postres" });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain("insufficient role permissions");
  });
});
