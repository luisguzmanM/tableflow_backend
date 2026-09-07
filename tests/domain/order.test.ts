import { describe, it, expect } from "vitest";
import { Order } from "../../src/modules/order/domain/Order";
import { OrderItem } from "../../src/modules/order/domain/OrderItem";
import { SelectedModifier } from "../../src/modules/order/domain/SelectedModifier";

describe("Order Domain Entity", () => {
  const createValidItem = () => {
    return new OrderItem({
      productName: "Hamburguesa Clásica",
      unitPrice: 12.5,
      quantity: 2,
      selectedModifiers: [
        new SelectedModifier({ modifierName: "Extra queso", price: 1.2 }),
        new SelectedModifier({ modifierName: "Bacon", price: 1.8 }),
      ],
    });
  };

  it("should calculate correct subtotal for an order item with modifiers", () => {
    const item = createValidItem();
    // (12.50 + 1.20 + 1.80) * 2 = 15.50 * 2 = 31.00
    expect(item.calculateSubtotal()).toBe(31.0);
  });

  it("should calculate correct total for an order", () => {
    const item1 = createValidItem(); // 31.00
    const item2 = new OrderItem({
      productName: "Coca-Cola",
      unitPrice: 2.8,
      quantity: 1,
    }); // 2.80

    const order = new Order({
      tableId: "tbl-123",
      items: [item1, item2],
    });

    expect(order.calculateTotal()).toBe(33.8);
    expect(order.status).toBe("PENDING");
  });

  it("should reject an order without items", () => {
    expect(() => {
      new Order({
        tableId: "tbl-123",
        items: [],
      });
    }).toThrow("Order must contain at least one order item");
  });

  it("should follow valid status lifecycle transitions", () => {
    const order = new Order({
      tableId: "tbl-123",
      items: [createValidItem()],
    });

    expect(order.status).toBe("PENDING");

    order.transitionTo("PREPARING");
    expect(order.status).toBe("PREPARING");

    order.transitionTo("READY");
    expect(order.status).toBe("READY");

    order.transitionTo("DELIVERED");
    expect(order.status).toBe("DELIVERED");
  });

  it("should reject invalid status transitions", () => {
    const order = new Order({
      tableId: "tbl-123",
      items: [createValidItem()],
    });

    // PENDING cannot jump directly to DELIVERED
    expect(() => order.transitionTo("DELIVERED")).toThrow("Invalid status transition");

    // DELIVERED cannot transition to anything
    order.transitionTo("PREPARING");
    order.transitionTo("READY");
    order.transitionTo("DELIVERED");

    expect(() => order.transitionTo("PREPARING")).toThrow("Invalid status transition");
  });

  it("should allow cancellation from PENDING, PREPARING, and READY", () => {
    const order1 = new Order({ tableId: "tbl-1", items: [createValidItem()] });
    order1.transitionTo("CANCELLED");
    expect(order1.status).toBe("CANCELLED");

    const order2 = new Order({ tableId: "tbl-2", items: [createValidItem()] });
    order2.transitionTo("PREPARING");
    order2.transitionTo("CANCELLED");
    expect(order2.status).toBe("CANCELLED");
  });
});
