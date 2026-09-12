import { OrderStatus } from "./OrderStatus";

export interface OrderCreatedEvent {
  orderId: string;
  tableId: string;
  tableNumber: number;
  branchId: string;
  status: OrderStatus;
  total: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    modifiers: string[];
  }>;
  createdAt: Date;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  tableId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  updatedAt: Date;
}

export interface OrderPaidEvent {
  orderId: string;
  tableId: string;
  total: number;
  paymentMethod: string;
  paidAt: Date;
}

export interface OrderEventBroadcaster {
  publishOrderCreated(event: OrderCreatedEvent): void;
  publishOrderStatusChanged(event: OrderStatusChangedEvent): void;
  publishOrderPaid(event: OrderPaidEvent): void;
}
