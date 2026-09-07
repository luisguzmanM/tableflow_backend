import { OrderRepository } from "../domain/OrderRepository";
import { OrderStatus } from "../domain/OrderStatus";

export interface OrderDetailsOutput {
  id: string;
  tableId: string;
  status: OrderStatus;
  total: number;
  items: Array<{
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    modifiers: Array<{
      modifierName: string;
      price: number;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class GetOrderById {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string): Promise<OrderDetailsOutput> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Order not found");
      (error as any).statusCode = 404;
      throw error;
    }

    return {
      id: order.id!,
      tableId: order.tableId,
      status: order.status,
      total: order.calculateTotal(),
      items: order.items.map((i) => ({
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        subtotal: i.calculateSubtotal(),
        modifiers: i.selectedModifiers.map((m) => ({
          modifierName: m.modifierName,
          price: m.price,
        })),
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
