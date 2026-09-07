import { Order } from "./Order";
import { OrderStatus } from "./OrderStatus";

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByTableId(tableId: string): Promise<Order[]>;
  findByBranchAndStatus(branchId: string, statuses?: OrderStatus[]): Promise<Order[]>;
  save(order: Order): Promise<string>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
}
