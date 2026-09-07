import { describe, it, expect, vi } from "vitest";
import { CreateOrderFromTable } from "../../src/modules/order/application/CreateOrderFromTable";
import { TableRepository } from "../../src/modules/restaurant/domain/TableRepository";
import { MenuRepository } from "../../src/modules/menu/domain/MenuRepository";
import { OrderRepository } from "../../src/modules/order/domain/OrderRepository";
import { Table } from "../../src/modules/restaurant/domain/Table";
import { MenuItem } from "../../src/modules/menu/domain/MenuItem";
import { ModifierGroup } from "../../src/modules/menu/domain/ModifierGroup";
import { Modifier } from "../../src/modules/menu/domain/Modifier";

describe("CreateOrderFromTable Use Case", () => {
  const mockTable = new Table({
    id: "table-1",
    branchId: "branch-1",
    number: 7,
    qrToken: "tbl_tok_007",
  });

  const cookingModifierGroup = new ModifierGroup({
    id: "mg-cooking",
    menuItemId: "item-burger",
    name: "Punto de la carne",
    minSelections: 1,
    maxSelections: 1,
    modifiers: [
      new Modifier({
        id: "mod-medium",
        modifierGroupId: "mg-cooking",
        name: "Al punto",
        price: 0,
        available: true,
      }),
    ],
  });

  const extrasModifierGroup = new ModifierGroup({
    id: "mg-extras",
    menuItemId: "item-burger",
    name: "Extras",
    minSelections: 0,
    maxSelections: 2,
    modifiers: [
      new Modifier({
        id: "mod-cheese",
        modifierGroupId: "mg-extras",
        name: "Extra queso",
        price: 1.2,
        available: true,
      }),
      new Modifier({
        id: "mod-bacon-unavail",
        modifierGroupId: "mg-extras",
        name: "Bacon",
        price: 1.8,
        available: false,
      }),
    ],
  });

  const burgerMenuItem = new MenuItem({
    id: "item-burger",
    categoryId: "cat-1",
    name: "Hamburguesa Clásica",
    price: 12.5,
    available: true,
    modifierGroups: [cookingModifierGroup, extrasModifierGroup],
  });

  const unavailableMenuItem = new MenuItem({
    id: "item-lava",
    categoryId: "cat-2",
    name: "Coulant de Chocolate",
    price: 7.2,
    available: false,
  });

  const mockTableRepository: TableRepository = {
    findById: vi.fn(),
    findByQrToken: vi.fn(),
    findByBranchId: vi.fn(),
    save: vi.fn(),
  };

  const mockMenuRepository: MenuRepository = {
    findByRestaurantId: vi.fn(),
    findCategoryById: vi.fn(),
    findMenuItemById: vi.fn(),
    saveMenu: vi.fn(),
    saveCategory: vi.fn(),
    saveMenuItem: vi.fn(),
  };

  const mockOrderRepository: OrderRepository = {
    findById: vi.fn(),
    findByTableId: vi.fn(),
    findByBranchAndStatus: vi.fn(),
    save: vi.fn(),
    updateStatus: vi.fn(),
  };

  it("should create order with snapshots and calculate correct total", async () => {
    vi.mocked(mockTableRepository.findByQrToken).mockResolvedValue(mockTable);
    vi.mocked(mockMenuRepository.findMenuItemById).mockResolvedValue(burgerMenuItem);
    vi.mocked(mockOrderRepository.save).mockResolvedValue("ord-generated-id");

    const useCase = new CreateOrderFromTable(
      mockTableRepository,
      mockMenuRepository,
      mockOrderRepository
    );

    const result = await useCase.execute({
      qrToken: "tbl_tok_007",
      items: [
        {
          menuItemId: "item-burger",
          quantity: 2,
          modifierIds: ["mod-medium", "mod-cheese"],
        },
      ],
    });

    expect(result.id).toBe("ord-generated-id");
    expect(result.tableId).toBe("table-1");
    expect(result.status).toBe("PENDING");
    // (12.50 + 0 + 1.20) * 2 = 27.40
    expect(result.total).toBe(27.4);
    expect(mockOrderRepository.save).toHaveBeenCalledTimes(1);
  });

  it("should reject ordering an unavailable menu item", async () => {
    vi.mocked(mockTableRepository.findByQrToken).mockResolvedValue(mockTable);
    vi.mocked(mockMenuRepository.findMenuItemById).mockResolvedValue(unavailableMenuItem);

    const useCase = new CreateOrderFromTable(
      mockTableRepository,
      mockMenuRepository,
      mockOrderRepository
    );

    await expect(
      useCase.execute({
        qrToken: "tbl_tok_007",
        items: [{ menuItemId: "item-lava", quantity: 1 }],
      })
    ).rejects.toThrow("currently unavailable");
  });

  it("should reject when modifier min/max bounds are violated", async () => {
    vi.mocked(mockTableRepository.findByQrToken).mockResolvedValue(mockTable);
    vi.mocked(mockMenuRepository.findMenuItemById).mockResolvedValue(burgerMenuItem);

    const useCase = new CreateOrderFromTable(
      mockTableRepository,
      mockMenuRepository,
      mockOrderRepository
    );

    // Missing required modifier from cooking group (minSelections: 1)
    await expect(
      useCase.execute({
        qrToken: "tbl_tok_007",
        items: [{ menuItemId: "item-burger", quantity: 1, modifierIds: [] }],
      })
    ).rejects.toThrow("Punto de la carne' requires between 1 and 1 selections");
  });

  it("should reject when selecting an unavailable modifier", async () => {
    vi.mocked(mockTableRepository.findByQrToken).mockResolvedValue(mockTable);
    vi.mocked(mockMenuRepository.findMenuItemById).mockResolvedValue(burgerMenuItem);

    const useCase = new CreateOrderFromTable(
      mockTableRepository,
      mockMenuRepository,
      mockOrderRepository
    );

    await expect(
      useCase.execute({
        qrToken: "tbl_tok_007",
        items: [
          {
            menuItemId: "item-burger",
            quantity: 1,
            modifierIds: ["mod-medium", "mod-bacon-unavail"],
          },
        ],
      })
    ).rejects.toThrow("Modifier 'Bacon' is currently unavailable");
  });
});
