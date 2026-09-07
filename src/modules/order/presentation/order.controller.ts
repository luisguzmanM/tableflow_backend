import { Response, NextFunction } from "express";
import { CreateOrderFromTable } from "../application/CreateOrderFromTable";
import { UpdateOrderStatus } from "../application/UpdateOrderStatus";
import { GetActiveOrdersByBranch } from "../application/GetActiveOrdersByBranch";
import { GetOrderById } from "../application/GetOrderById";
import { PayOrder } from "../application/PayOrder";
import { AuthenticatedRequest } from "../../auth/presentation/auth.middleware";
import { OrderStatus } from "../domain/OrderStatus";

export class OrderController {
  constructor(
    private readonly createOrderFromTable: CreateOrderFromTable,
    private readonly updateOrderStatus: UpdateOrderStatus,
    private readonly getActiveOrdersByBranch: GetActiveOrdersByBranch,
    private readonly getOrderById: GetOrderById,
    private readonly payOrderUseCase: PayOrder
  ) {}

  create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.createOrderFromTable.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.getOrderById.execute(id);
      res.status(200).json({ order });
    } catch (error) {
      next(error);
    }
  };

  listBranchOrders = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const statusQuery = req.query.status as string | undefined;
      const statuses = statusQuery
        ? (statusQuery.split(",") as OrderStatus[])
        : undefined;

      const orders = await this.getActiveOrdersByBranch.execute(
        req.user.branchId,
        statuses
      );

      res.status(200).json({ orders });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await this.updateOrderStatus.execute({
        orderId: id,
        nextStatus: status,
      });

      res.status(200).json({ message: "Order status updated successfully", status });
    } catch (error) {
      next(error);
    }
  };

  pay = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { paymentMethod, paidBy } = req.body;

      const order = await this.payOrderUseCase.execute(id, {
        paymentMethod,
        paidBy,
      });

      res.status(200).json({ message: "Order paid successfully", order });
    } catch (error) {
      next(error);
    }
  };
}
