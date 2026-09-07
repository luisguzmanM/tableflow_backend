import { PostgresOrderRepository } from "../infrastructure/PostgresOrderRepository";
import { OrderStatus } from "../domain/OrderStatus";

export interface BranchOrderSummary {
  id: string;
  tableNumber: number;
  status: OrderStatus;
  total: number;
  itemsCount: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    modifiers: string[];
  }>;
  createdAt: Date;
}

export class GetActiveOrdersByBranch {
  constructor(private readonly orderRepository: PostgresOrderRepository) {}

  async execute(branchId: string, statuses?: OrderStatus[]): Promise<BranchOrderSummary[]> {
    const orderContexts = await this.orderRepository.findWithContextByBranchAndStatus(branchId, statuses);

    return orderContexts.map((ctx) => ({
      id: ctx.order.id!,
      tableNumber: ctx.tableNumber,
      status: ctx.order.status,
      total: ctx.order.calculateTotal(),
      itemsCount: ctx.order.items.reduce((sum, item) => sum + item.quantity, 0),
      items: ctx.order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        modifiers: i.selectedModifiers.map((m) => m.modifierName),
      })),
      createdAt: ctx.order.createdAt,
    }));
  }
}
