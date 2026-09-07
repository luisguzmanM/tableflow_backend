import { Router } from "express";
import { MenuController } from "./menu.controller";
import { GetCustomerMenuByQr } from "../application/GetCustomerMenuByQr";
import { GetRestaurantMenu } from "../application/GetRestaurantMenu";
import { CreateCategory } from "../application/CreateCategory";
import { CreateMenuItem } from "../application/CreateMenuItem";
import { ToggleMenuItemAvailability } from "../application/ToggleMenuItemAvailability";
import { UpdateMenuItem } from "../application/UpdateMenuItem";
import { DeleteMenuItem } from "../application/DeleteMenuItem";
import { PostgresMenuRepository } from "../infrastructure/PostgresMenuRepository";
import { PostgresTableRepository } from "../../restaurant/infrastructure/PostgresTableRepository";
import { validateRequest } from "../../../shared/presentation/middlewares/validateRequest";
import { createCategorySchema, createMenuItemSchema, toggleAvailabilitySchema, updateMenuItemSchema } from "./menu.schemas";
import { requireAuth, requireRole } from "../../auth/presentation/auth.middleware";

export function createMenuRouter(): Router {
  const router = Router();

  const menuRepository = new PostgresMenuRepository();
  const tableRepository = new PostgresTableRepository();

  const getCustomerMenuByQrUseCase = new GetCustomerMenuByQr(tableRepository, menuRepository);
  const getRestaurantMenuUseCase = new GetRestaurantMenu(menuRepository);
  const createCategoryUseCase = new CreateCategory(menuRepository);
  const createMenuItemUseCase = new CreateMenuItem(menuRepository);
  const toggleMenuItemAvailabilityUseCase = new ToggleMenuItemAvailability(menuRepository);
  const updateMenuItemUseCase = new UpdateMenuItem(menuRepository);
  const deleteMenuItemUseCase = new DeleteMenuItem(menuRepository);

  const menuController = new MenuController(
    getCustomerMenuByQrUseCase,
    getRestaurantMenuUseCase,
    createCategoryUseCase,
    createMenuItemUseCase,
    toggleMenuItemAvailabilityUseCase,
    updateMenuItemUseCase,
    deleteMenuItemUseCase
  );

  // Public endpoint: Scan table QR to view menu
  router.get("/public/:qrToken", menuController.getPublicMenuByQr);

  // Authenticated endpoints
  router.get("/", requireAuth, menuController.getMenu);

  // Admin-only management endpoints
  router.post(
    "/categories",
    requireAuth,
    requireRole("ADMIN"),
    validateRequest(createCategorySchema),
    menuController.addCategory
  );

  router.post(
    "/items",
    requireAuth,
    requireRole("ADMIN"),
    validateRequest(createMenuItemSchema),
    menuController.addItem
  );

  router.patch(
    "/items/:id/availability",
    requireAuth,
    requireRole("ADMIN"),
    validateRequest(toggleAvailabilitySchema),
    menuController.toggleAvailability
  );

  router.put(
    "/items/:id",
    requireAuth,
    requireRole("ADMIN"),
    validateRequest(updateMenuItemSchema),
    menuController.updateItem
  );

  router.delete(
    "/items/:id",
    requireAuth,
    requireRole("ADMIN"),
    menuController.deleteItem
  );

  return router;
}
