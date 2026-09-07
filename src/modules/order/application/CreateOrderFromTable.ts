import { OrderRepository } from "../domain/OrderRepository";
import { TableRepository } from "../../restaurant/domain/TableRepository";
import { MenuRepository } from "../../menu/domain/MenuRepository";
import { OrderEventBroadcaster } from "../domain/OrderEventBroadcaster";
import { Order } from "../domain/Order";
import { OrderItem } from "../domain/OrderItem";
import { SelectedModifier } from "../domain/SelectedModifier";
import { OrderStatus } from "../domain/OrderStatus";

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
  modifierIds?: string[];
}

export interface CreateOrderInput {
  qrToken: string;
  items: CreateOrderItemInput[];
}

export interface CreateOrderOutput {
  id: string;
  tableId: string;
  status: OrderStatus;
  total: number;
  createdAt: Date;
}

export class CreateOrderFromTable {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly menuRepository: MenuRepository,
    private readonly orderRepository: OrderRepository,
    private readonly eventBroadcaster?: OrderEventBroadcaster
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    if (!input.items || input.items.length === 0) {
      const error = new Error("Order must contain at least one item");
      (error as any).statusCode = 400;
      throw error;
    }

    // 1. Locate table by QR token
    const table = await this.tableRepository.findByQrToken(input.qrToken);
    if (!table) {
      const error = new Error("Table not found for provided QR token");
      (error as any).statusCode = 404;
      throw error;
    }

    const domainOrderItems: OrderItem[] = [];

    for (const itemInput of input.items) {
      if (!Number.isInteger(itemInput.quantity) || itemInput.quantity <= 0) {
        const error = new Error("Item quantity must be a positive integer");
        (error as any).statusCode = 400;
        throw error;
      }

      const menuItem = await this.menuRepository.findMenuItemById(itemInput.menuItemId);
      if (!menuItem) {
        const error = new Error(`Menu item not found: ${itemInput.menuItemId}`);
        (error as any).statusCode = 404;
        throw error;
      }

      if (!menuItem.available) {
        const error = new Error(`Menu item '${menuItem.name}' is currently unavailable`);
        (error as any).statusCode = 400;
        throw error;
      }

      const selectedModifiers: SelectedModifier[] = [];
      const requestedModIds = itemInput.modifierIds || [];

      // Validate Modifier Groups constraints
      for (const group of menuItem.modifierGroups) {
        const selectedForGroup = group.modifiers.filter((m) =>
          requestedModIds.includes(m.id)
        );

        if (!group.validateSelectionCount(selectedForGroup.length)) {
          const error = new Error(
            `Modifier group '${group.name}' requires between ${group.minSelections} and ${group.maxSelections} selections (received ${selectedForGroup.length})`
          );
          (error as any).statusCode = 400;
          throw error;
        }

        for (const mod of selectedForGroup) {
          if (!mod.available) {
            const error = new Error(`Modifier '${mod.name}' is currently unavailable`);
            (error as any).statusCode = 400;
            throw error;
          }

          // Snapshot of modifier at order time
          selectedModifiers.push(
            new SelectedModifier({
              modifierId: mod.id,
              modifierName: mod.name,
              price: mod.price,
            })
          );
        }
      }

      // Snapshot of product at order time
      domainOrderItems.push(
        new OrderItem({
          menuItemId: menuItem.id,
          productName: menuItem.name,
          unitPrice: menuItem.price,
          quantity: itemInput.quantity,
          selectedModifiers,
        })
      );
    }

    const order = new Order({
      tableId: table.id,
      items: domainOrderItems,
    });

    const orderId = await this.orderRepository.save(order);

    // Broadcast Realtime Event
    if (this.eventBroadcaster) {
      this.eventBroadcaster.publishOrderCreated({
        orderId,
        tableId: table.id,
        tableNumber: table.number,
        branchId: table.branchId,
        status: order.status,
        total: order.calculateTotal(),
        items: domainOrderItems.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          modifiers: item.selectedModifiers.map((m) => m.modifierName),
        })),
        createdAt: order.createdAt,
      });
    }

    return {
      id: orderId,
      tableId: order.tableId,
      status: order.status,
      total: order.calculateTotal(),
      createdAt: order.createdAt,
    };
  }
}
