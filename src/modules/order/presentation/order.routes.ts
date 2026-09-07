import { Router } from "express";
import { OrderController } from "./order.controller";
import { CreateOrderFromTable } from "../application/CreateOrderFromTable";
import { UpdateOrderStatus } from "../application/UpdateOrderStatus";
import { GetActiveOrdersByBranch } from "../application/GetActiveOrdersByBranch";
import { GetOrderById } from "../application/GetOrderById";
import { PayOrder } from "../application/PayOrder";
import { PostgresOrderRepository } from "../infrastructure/PostgresOrderRepository";
import { PostgresTableRepository } from "../../restaurant/infrastructure/PostgresTableRepository";
import { PostgresMenuRepository } from "../../menu/infrastructure/PostgresMenuRepository";
import { orderBroadcaster } from "../infrastructure/WebSocketOrderBroadcaster";
import { validateRequest } from "../../../shared/presentation/middlewares/validateRequest";
import { createOrderSchema, updateStatusSchema, payOrderSchema } from "./order.schemas";
import { requireAuth } from "../../auth/presentation/auth.middleware";

export function createOrderRouter(): Router {
  const router = Router();

  const orderRepository = new PostgresOrderRepository();
  const tableRepository = new PostgresTableRepository();
  const menuRepository = new PostgresMenuRepository();

  const createOrderUseCase = new CreateOrderFromTable(
    tableRepository,
    menuRepository,
    orderRepository,
    orderBroadcaster
  );
  const updateOrderStatusUseCase = new UpdateOrderStatus(orderRepository, orderBroadcaster);
  const getActiveOrdersByBranchUseCase = new GetActiveOrdersByBranch(orderRepository);
  const getOrderByIdUseCase = new GetOrderById(orderRepository);
  const payOrderUseCase = new PayOrder(orderRepository);

  const orderController = new OrderController(
    createOrderUseCase,
    updateOrderStatusUseCase,
    getActiveOrdersByBranchUseCase,
    getOrderByIdUseCase,
    payOrderUseCase
  );

  // Public: Customer creates order from table QR
  router.post("/", validateRequest(createOrderSchema), orderController.create);

  // Public: Customer queries their order by ID
  router.get("/:id", orderController.getById);

  // Public/Customer: Pay for their order
  router.post("/:id/pay", validateRequest(payOrderSchema), orderController.pay);

  // Authenticated: Employees list active branch orders
  router.get("/", requireAuth, orderController.listBranchOrders);

  // Authenticated: Employees update status (e.g. kitchen starts preparing, marks ready, etc.)
  router.patch(
    "/:id/status",
    requireAuth,
    validateRequest(updateStatusSchema),
    orderController.updateStatus
  );

  return router;
}
