import { describe, it, expect, vi } from "vitest";
import { UpdateOrderStatus } from "../../src/modules/order/application/UpdateOrderStatus";
import { OrderRepository } from "../../src/modules/order/domain/OrderRepository";
import { Order } from "../../src/modules/order/domain/Order";
import { OrderItem } from "../../src/modules/order/domain/OrderItem";

describe("UpdateOrderStatus Use Case", () => {
  const mockOrder = new Order({
    id: "order-123",
    tableId: "table-1",
    status: "PENDING",
    items: [
      new OrderItem({
        productName: "Coca-Cola",
        unitPrice: 2.8,
        quantity: 1,
      }),
    ],
  });

  const mockOrderRepository: OrderRepository = {
    findById: vi.fn(),
    findByTableId: vi.fn(),
    findByBranchAndStatus: vi.fn(),
    save: vi.fn(),
    updateStatus: vi.fn(),
  };

  it("should advance order status according to valid lifecycle transition", async () => {
    vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder);

    const useCase = new UpdateOrderStatus(mockOrderRepository);
    await useCase.execute({
      orderId: "order-123",
      nextStatus: "PREPARING",
    });

    expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith("order-123", "PREPARING");
  });

  it("should reject invalid status transition", async () => {
    vi.mocked(mockOrderRepository.findById).mockResolvedValue(mockOrder);

    const useCase = new UpdateOrderStatus(mockOrderRepository);

    // PENDING cannot jump to DELIVERED
    await expect(
      useCase.execute({
        orderId: "order-123",
        nextStatus: "DELIVERED",
      })
    ).rejects.toThrow("Invalid status transition");
  });
});
