import { Router } from "express";
import { RestaurantController } from "./restaurant.controller";
import { GetRestaurantById } from "../application/GetRestaurantById";
import { UpdateRestaurant } from "../application/UpdateRestaurant";
import { ListBranches } from "../application/ListBranches";
import { PostgresRestaurantRepository } from "../infrastructure/PostgresRestaurantRepository";
import { PostgresBranchRepository } from "../infrastructure/PostgresBranchRepository";
import { requireAuth, requireRole } from "../../auth/presentation/auth.middleware";

export function createRestaurantRouter(): Router {
  const router = Router();

  const restaurantRepository = new PostgresRestaurantRepository();
  const branchRepository = new PostgresBranchRepository();

  const getRestaurantById = new GetRestaurantById(restaurantRepository);
  const updateRestaurant = new UpdateRestaurant(restaurantRepository);
  const listBranches = new ListBranches(branchRepository);

  const restaurantController = new RestaurantController(
    getRestaurantById,
    updateRestaurant,
    listBranches
  );

  // Protected endpoints
  router.get("/:id", requireAuth, restaurantController.getRestaurant);
  router.patch("/:id", requireAuth, requireRole("ADMIN"), restaurantController.updateRestaurant);
  
  // Actually, branches usually sit at a root /api/branches, but we can put it here or as a separate route file.
  // We'll expose it under /api/restaurants/branches for now, but in the implementation plan we said /api/branches.
  // Let's create a separate router for branches or just mount it differently. 
  // Wait, if it's in the restaurant module, it can be here. But since `restaurant.routes.ts` will be mounted at `/api/restaurants`,
  // branches could be `/api/restaurants/:id/branches` or just `/api/branches` mounted separately.
  // I will just add an endpoint `/api/branches` in `app.ts` using a `createBranchRouter()`.
  
  return router;
}

export function createBranchRouter(): Router {
  const router = Router();
  const branchRepository = new PostgresBranchRepository();
  const listBranches = new ListBranches(branchRepository);

  // We need a small controller logic for branches
  const listBranchesController = async (req: any, res: any, next: any) => {
    try {
      const branches = await listBranches.execute(req.user.restaurantId);
      res.json(branches);
    } catch (err) {
      next(err);
    }
  };

  router.get("/", requireAuth, listBranchesController);

  return router;
}
