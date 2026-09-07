import { describe, it, expect, vi } from "vitest";
import { GetCustomerMenuByQr } from "../../src/modules/menu/application/GetCustomerMenuByQr";
import { PostgresTableRepository } from "../../src/modules/restaurant/infrastructure/PostgresTableRepository";
import { MenuRepository } from "../../src/modules/menu/domain/MenuRepository";
import { Table } from "../../src/modules/restaurant/domain/Table";
import { Menu } from "../../src/modules/menu/domain/Menu";

describe("GetCustomerMenuByQr Use Case", () => {
  const mockTable = new Table({
    id: "table-1",
    branchId: "branch-1",
    number: 7,
    seats: 4,
    qrToken: "tbl_tok_007",
  });

  const mockMenu = new Menu({
    id: "menu-1",
    restaurantId: "rest-1",
    categories: [],
  });

  const mockTableRepository = {
    findWithContextByQrToken: vi.fn(),
  } as unknown as PostgresTableRepository;

  const mockMenuRepository: MenuRepository = {
    findByRestaurantId: vi.fn(),
    findCategoryById: vi.fn(),
    findMenuItemById: vi.fn(),
    saveMenu: vi.fn(),
    saveCategory: vi.fn(),
    saveMenuItem: vi.fn(),
  };

  it("should return table context and restaurant menu when QR token is valid", async () => {
    vi.mocked(mockTableRepository.findWithContextByQrToken).mockResolvedValue({
      table: mockTable,
      branchName: "Downtown Central",
      restaurantId: "rest-1",
      restaurantName: "Olive & Ember",
    });

    vi.mocked(mockMenuRepository.findByRestaurantId).mockResolvedValue(mockMenu);

    const useCase = new GetCustomerMenuByQr(mockTableRepository, mockMenuRepository);
    const result = await useCase.execute("tbl_tok_007");

    expect(result.restaurant.name).toBe("Olive & Ember");
    expect(result.table.number).toBe(7);
    expect(result.menu?.id).toBe("menu-1");
  });

  it("should throw 404 if table QR token does not exist", async () => {
    vi.mocked(mockTableRepository.findWithContextByQrToken).mockResolvedValue(null);

    const useCase = new GetCustomerMenuByQr(mockTableRepository, mockMenuRepository);
    await expect(useCase.execute("invalid_token")).rejects.toThrow("Table not found for QR token");
  });
});
