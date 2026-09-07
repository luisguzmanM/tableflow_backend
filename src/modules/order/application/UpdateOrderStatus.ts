import { OrderRepository } from "../domain/OrderRepository";
import { OrderStatus } from "../domain/OrderStatus";
import { OrderEventBroadcaster } from "../domain/OrderEventBroadcaster";

export interface UpdateOrderStatusInput {
  orderId: string;
  nextStatus: OrderStatus;
}

export class UpdateOrderStatus {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBroadcaster?: OrderEventBroadcaster
  ) {}

  async execute(input: UpdateOrderStatusInput): Promise<void> {
    const order = await this.orderRepository.findById(input.orderId);

    if (!order) {
      const error = new Error("Order not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const previousStatus = order.status;

    // Domain enforces valid lifecycle transition rules
    order.transitionTo(input.nextStatus);

    await this.orderRepository.updateStatus(input.orderId, input.nextStatus);

    // Broadcast Realtime Event
    if (this.eventBroadcaster) {
      this.eventBroadcaster.publishOrderStatusChanged({
        orderId: input.orderId,
        tableId: order.tableId,
        previousStatus,
        newStatus: input.nextStatus,
        updatedAt: order.updatedAt,
      });
    }
  }
}
