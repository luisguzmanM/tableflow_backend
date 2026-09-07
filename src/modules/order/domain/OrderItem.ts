import { SelectedModifier } from "./SelectedModifier";

export interface OrderItemProps {
  id?: string;
  orderId?: string;
  menuItemId?: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  selectedModifiers?: SelectedModifier[];
  createdAt?: Date;
}

export class OrderItem {
  readonly id?: string;
  readonly orderId?: string;
  readonly menuItemId: string | null;
  readonly productName: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly selectedModifiers: SelectedModifier[];
  readonly createdAt: Date;

  constructor(props: OrderItemProps) {
    if (!props.productName || props.productName.trim().length === 0) {
      throw new Error("OrderItem must have a productName snapshot");
    }
    if (props.unitPrice < 0) {
      throw new Error("OrderItem unitPrice cannot be negative");
    }
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new Error("OrderItem quantity must be a positive integer");
    }

    this.id = props.id;
    this.orderId = props.orderId;
    this.menuItemId = props.menuItemId ?? null;
    this.productName = props.productName.trim();
    this.unitPrice = props.unitPrice;
    this.quantity = props.quantity;
    this.selectedModifiers = props.selectedModifiers ? [...props.selectedModifiers] : [];
    this.createdAt = props.createdAt || new Date();
  }

  calculateSubtotal(): number {
    const modifiersTotal = this.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
    const itemTotal = (this.unitPrice + modifiersTotal) * this.quantity;
    return Number(itemTotal.toFixed(2));
  }
}
