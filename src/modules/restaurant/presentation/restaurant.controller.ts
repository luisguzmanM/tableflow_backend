import { Request, Response, NextFunction } from "express";
import { GetRestaurantById } from "../application/GetRestaurantById";
import { UpdateRestaurant } from "../application/UpdateRestaurant";
import { ListBranches } from "../application/ListBranches";

export class RestaurantController {
  constructor(
    private readonly getRestaurantById: GetRestaurantById,
    private readonly updateRestaurantUseCase: UpdateRestaurant,
    private readonly listBranchesUseCase: ListBranches
  ) {}

  getRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In a real multi-tenant app, we'd ensure req.user.restaurantId matches req.params.id
      const id = req.params.id;
      const restaurant = await this.getRestaurantById.execute(id);
      res.json(restaurant);
    } catch (error) {
      next(error);
    }
  };

  updateRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const updated = await this.updateRestaurantUseCase.execute(id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  listBranches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Typically branch list is filtered by the authenticated user's restaurant
      const user = (req as any).user;
      const branches = await this.listBranchesUseCase.execute(user.restaurantId);
      res.json(branches);
    } catch (error) {
      next(error);
    }
  };
}
