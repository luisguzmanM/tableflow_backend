import { Response, NextFunction } from "express";
import { GetCustomerMenuByQr } from "../application/GetCustomerMenuByQr";
import { GetRestaurantMenu } from "../application/GetRestaurantMenu";
import { CreateCategory } from "../application/CreateCategory";
import { CreateMenuItem } from "../application/CreateMenuItem";
import { ToggleMenuItemAvailability } from "../application/ToggleMenuItemAvailability";
import { UpdateMenuItem } from "../application/UpdateMenuItem";
import { DeleteMenuItem } from "../application/DeleteMenuItem";
import { AuthenticatedRequest } from "../../auth/presentation/auth.middleware";

export class MenuController {
  constructor(
    private readonly getCustomerMenuByQr: GetCustomerMenuByQr,
    private readonly getRestaurantMenu: GetRestaurantMenu,
    private readonly createCategory: CreateCategory,
    private readonly createMenuItem: CreateMenuItem,
    private readonly toggleMenuItemAvailability: ToggleMenuItemAvailability,
    private readonly updateMenuItem: UpdateMenuItem,
    private readonly deleteMenuItem: DeleteMenuItem
  ) {}

  getPublicMenuByQr = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { qrToken } = req.params;
      const result = await this.getCustomerMenuByQr.execute(qrToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMenu = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const menu = await this.getRestaurantMenu.execute(req.user.restaurantId);
      
      if (!menu) {
        res.status(404).json({ error: "Menu not found" });
        return;
      }

      // Flatten structure for the admin frontend
      const categories = menu.categories.map((c) => ({
        id: c.id,
        name: c.name,
        position: c.position,
      }));

      const items = menu.categories.flatMap((c) =>
        c.items.map((i) => ({
          id: i.id,
          categoryId: i.categoryId,
          name: i.name,
          description: i.description,
          price: i.price,
          image: i.image,
          available: i.available,
          position: i.position,
        }))
      );

      const modifierGroups = menu.categories.flatMap((c) =>
        c.items.flatMap((i) =>
          i.modifierGroups.map((g) => ({
            id: g.id,
            menuItemId: g.menuItemId,
            name: g.name,
            minSelections: g.minSelections,
            maxSelections: g.maxSelections,
            position: g.position,
          }))
        )
      );

      const modifiers = menu.categories.flatMap((c) =>
        c.items.flatMap((i) =>
          i.modifierGroups.flatMap((g) =>
            g.modifiers.map((m) => ({
              id: m.id,
              modifierGroupId: m.modifierGroupId,
              name: m.name,
              price: m.price,
              available: m.available,
              position: m.position,
            }))
          )
        )
      );

      res.status(200).json({
        menu: { id: menu.id, restaurantId: menu.restaurantId },
        categories,
        items,
        modifierGroups,
        modifiers,
      });
    } catch (error) {
      next(error);
    }
  };

  addCategory = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const category = await this.createCategory.execute({
        restaurantId: req.user.restaurantId,
        name: req.body.name,
        position: req.body.position,
      });
      res.status(201).json({ category });
    } catch (error) {
      next(error);
    }
  };

  addItem = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const menuItem = await this.createMenuItem.execute(req.body);
      res.status(201).json({ menuItem });
    } catch (error) {
      next(error);
    }
  };

  toggleAvailability = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.toggleMenuItemAvailability.execute({
        menuItemId: id,
        available: req.body.available,
      });
      res.status(200).json({ message: "Availability updated" });
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const menuItem = await this.updateMenuItem.execute({
        menuItemId: id,
        ...req.body
      });
      res.status(200).json({ menuItem });
    } catch (error) {
      next(error);
    }
  };

  deleteItem = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.deleteMenuItem.execute(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
