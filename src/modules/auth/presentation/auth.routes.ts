import { Router } from "express";
import { AuthController } from "./auth.controller";
import { LoginUser } from "../application/LoginUser";
import { GetCurrentUser } from "../application/GetCurrentUser";
import { RegisterAccount } from "../application/RegisterAccount";
import { PostgresUserRepository } from "../infrastructure/PostgresUserRepository";
import { BcryptPasswordHasher } from "../infrastructure/BcryptPasswordHasher";
import { JwtTokenService } from "../infrastructure/JwtTokenService";
import { PostgresAccountRegistrar } from "../infrastructure/PostgresAccountRegistrar";
import { validateRequest } from "../../../shared/presentation/middlewares/validateRequest";
import { loginSchema, registerSchema } from "./auth.schemas";
import { requireAuth } from "./auth.middleware";

export function createAuthRouter(): Router {
  const router = Router();

  const userRepository = new PostgresUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();
  const accountRegistrar = new PostgresAccountRegistrar();

  const loginUserUseCase = new LoginUser(userRepository, passwordHasher, tokenService);
  const getCurrentUserUseCase = new GetCurrentUser(userRepository);
  const registerAccountUseCase = new RegisterAccount(accountRegistrar, userRepository, passwordHasher, tokenService);

  const authController = new AuthController(loginUserUseCase, getCurrentUserUseCase, registerAccountUseCase);

  router.post("/register", validateRequest(registerSchema), authController.register);
  router.post("/login", validateRequest(loginSchema), authController.login);
  router.get("/me", requireAuth, authController.getMe);

  return router;
}
