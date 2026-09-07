import { Router, Request, Response, NextFunction } from "express";
import { PostgresUserRepository } from "../infrastructure/PostgresUserRepository";
import { ListBranchEmployees } from "../application/ListBranchEmployees";
import { GetUserById } from "../application/GetUserById";
import { requireAuth } from "./auth.middleware";

export function createUserRouter(): Router {
  const router = Router();
  const userRepository = new PostgresUserRepository();
  const listBranchEmployees = new ListBranchEmployees(userRepository);
  const getUserById = new GetUserById(userRepository);

  router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branchId = (req as any).user.branchId;
      const employees = await listBranchEmployees.execute(branchId);
      res.json(employees);
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In MVP any authenticated user can view users from the same branch theoretically, 
      // but typically we'd restrict it to admins or let users view their own info.
      const id = req.params.id;
      const user = await getUserById.execute(id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
