import { Response, NextFunction, Request } from "express";
import { LoginUser } from "../application/LoginUser";
import { GetCurrentUser } from "../application/GetCurrentUser";
import { RegisterAccount } from "../application/RegisterAccount";
import { AuthenticatedRequest } from "./auth.middleware";

export class AuthController {
  constructor(
    private readonly loginUser: LoginUser,
    private readonly getCurrentUser: GetCurrentUser,
    private readonly registerAccount?: RegisterAccount
  ) {}

  login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUser.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const user = await this.getCurrentUser.execute(req.user.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.registerAccount) {
        res.status(501).json({ error: "Register functionality is not configured" });
        return;
      }
      const result = await this.registerAccount.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
