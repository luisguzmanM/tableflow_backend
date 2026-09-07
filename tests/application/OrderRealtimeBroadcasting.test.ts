import { describe, it, expect, vi } from "vitest";
import { CreateOrderFromTable } from "../../src/modules/order/application/CreateOrderFromTable";
import { UpdateOrderStatus } from "../../src/modules/order/application/UpdateOrderStatus";
import { OrderEventBroadcaster } from "../../src/modules/order/domain/OrderEventBroadcaster";
import { TableRepository } from "../../src/modules/restaurant/domain/TableRepository";
import { MenuRepository } from "../../src/modules/menu/domain/MenuRepository";
import { OrderRepository } from "../../src/modules/order/domain/OrderRepository";
import { Table } from "../../src/modules/restaurant/domain/Table";
import { MenuItem } from "../../src/modules/menu/domain/MenuItem";
import { Order } from "../../src/modules/order/domain/Order";
import { OrderItem } from "../../src/modules/order/domain/OrderItem";

describe("Order Realtime Broadcasting", () => {
  const mockTable = new Table({
    id: "table-1",
    branchId: "branch-1",
    number: 7,
    qrToken: "tbl_tok_007",
  });

  const mockPizza = new MenuItem({
    id: "item-pizza",
    categoryId: "cat-1",
    name: "Margherita",
    price: 11.0,
    available: true,
  });

  const mockOrder = new Order({
    id: "order-123",
    tableId: "table-1",
    status: "PENDING",
    items: [
      new OrderItem({
        productName: "Margherita",
        unitPrice: 11.0,
        quantity: 1,
      }),
    ],
  });

  const mockTableRepo = {
    findByQrToken: vi.fn().mockResolvedValue(mockTable),
  } as unknown as TableRepository;

  const mockMenuRepo = {
    findMenuItemById: vi.fn().mockResolvedValue(mockPizza),
  } as unknown as MenuRepository;

  const mockOrderRepo: OrderRepository = {
    findById: vi.fn().mockResolvedValue(mockOrder),
    findByTableId: vi.fn(),
    findByBranchAndStatus: vi.fn(),
    save: vi.fn().mockResolvedValue("order-123"),
    updateStatus: vi.fn(),
  };

  const mockBroadcaster: OrderEventBroadcaster = {
    publishOrderCreated: vi.fn(),
    publishOrderStatusChanged: vi.fn(),
  };

  it("should publish ORDER_CREATED event when an order is placed", async () => {
    const createOrderUseCase = new CreateOrderFromTable(
      mockTableRepo,
      mockMenuRepo,
      mockOrderRepo,
      mockBroadcaster
    );

    await createOrderUseCase.execute({
      qrToken: "tbl_tok_007",
      items: [{ menuItemId: "item-pizza", quantity: 1 }],
    });

    expect(mockBroadcaster.publishOrderCreated).toHaveBeenCalledTimes(1);
    expect(mockBroadcaster.publishOrderCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-123",
        tableNumber: 7,
        branchId: "branch-1",
        total: 11.0,
      })
    );
  });

  it("should publish ORDER_STATUS_CHANGED event when status transitions", async () => {
    const updateStatusUseCase = new UpdateOrderStatus(mockOrderRepo, mockBroadcaster);

    await updateStatusUseCase.execute({
      orderId: "order-123",
      nextStatus: "PREPARING",
    });

    expect(mockBroadcaster.publishOrderStatusChanged).toHaveBeenCalledTimes(1);
    expect(mockBroadcaster.publishOrderStatusChanged).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-123",
        previousStatus: "PENDING",
        newStatus: "PREPARING",
      })
    );
  });
});
