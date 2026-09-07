import { OrderRepository } from "../domain/OrderRepository";
import { PaymentMethod } from "../domain/Order";

export interface PayOrderInput {
  paymentMethod: PaymentMethod;
  paidBy: string;
}

export class PayOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, input: PayOrderInput) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const error = new Error(`Order not found: ${orderId}`);
      (error as any).statusCode = 404;
      throw error;
    }

    order.markAsPaid(input.paymentMethod, input.paidBy);
    await this.orderRepository.save(order);
    return order;
  }
}
