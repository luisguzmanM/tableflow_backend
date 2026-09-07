import { OrderStatus, canTransitionOrder } from "./OrderStatus";
import { OrderItem } from "./OrderItem";

export type PaymentStatus = "UNPAID" | "PAID";
export type PaymentMethod = "CASH" | "CARD";

export interface OrderProps {
  id?: string;
  tableId: string;
  status?: OrderStatus;
  items: OrderItem[];
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: Date;
  paidBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order {
  readonly id?: string;
  readonly tableId: string;
  private _status: OrderStatus;
  private _items: OrderItem[];
  private _paymentStatus: PaymentStatus;
  private _paymentMethod?: PaymentMethod;
  private _paidAt?: Date;
  private _paidBy?: string;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: OrderProps) {
    if (!props.tableId) {
      throw new Error("Order must be associated with a table");
    }
    if (!props.items || props.items.length === 0) {
      throw new Error("Order must contain at least one order item");
    }

    this.id = props.id;
    this.tableId = props.tableId;
    this._status = props.status || "PENDING";
    this._items = [...props.items];
    this._paymentStatus = props.paymentStatus || "UNPAID";
    this._paymentMethod = props.paymentMethod;
    this._paidAt = props.paidAt;
    this._paidBy = props.paidBy;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get status(): OrderStatus {
    return this._status;
  }

  get paymentStatus(): PaymentStatus {
    return this._paymentStatus;
  }

  get paymentMethod(): PaymentMethod | undefined {
    return this._paymentMethod;
  }

  get paidAt(): Date | undefined {
    return this._paidAt;
  }

  get paidBy(): string | undefined {
    return this._paidBy;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  transitionTo(newStatus: OrderStatus): void {
    if (!canTransitionOrder(this._status, newStatus)) {
      throw new Error(`Invalid status transition from ${this._status} to ${newStatus}`);
    }
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  markAsPaid(paymentMethod: PaymentMethod, paidBy: string): void {
    if (this._paymentStatus === "PAID") {
      throw new Error("Order is already paid");
    }
    this._paymentStatus = "PAID";
    this._paymentMethod = paymentMethod;
    this._paidAt = new Date();
    this._paidBy = paidBy;
    this._updatedAt = new Date();
  }

  calculateTotal(): number {
    const total = this._items.reduce((acc, item) => acc + item.calculateSubtotal(), 0);
    return Number(total.toFixed(2));
  }
}
