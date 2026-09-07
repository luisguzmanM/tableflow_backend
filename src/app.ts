import express, { Express, Request, Response } from "express";
import cors from "cors";
import { config } from "./shared/config/env";
import { errorHandler } from "./shared/presentation/middlewares/errorHandler";
import { checkDatabaseConnection } from "./shared/infrastructure/database/pool";
import { createAuthRouter } from "./modules/auth/presentation/auth.routes";
import { createUserRouter } from "./modules/auth/presentation/user.routes";
import { createMenuRouter } from "./modules/menu/presentation/menu.routes";
import { createTableRouter } from "./modules/restaurant/presentation/table.routes";
import { createOrderRouter } from "./modules/order/presentation/order.routes";
import { createRestaurantRouter, createBranchRouter } from "./modules/restaurant/presentation/restaurant.routes";
import { createUploadRouter } from "./modules/upload/presentation/upload.routes";
import path from "path";

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin === "*" ? true : config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());

  // Base Health Check
  app.get("/health", async (_req: Request, res: Response) => {
    const dbConnected = await checkDatabaseConnection();
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbConnected ? "connected" : "disconnected",
    });
  });

  // Business Modules API Routes
  app.use("/api/auth", createAuthRouter());
  app.use("/api/users", createUserRouter());
  app.use("/api/menu", createMenuRouter());
  app.use("/api/tables", createTableRouter());
  app.use("/api/orders", createOrderRouter());
  app.use("/api/restaurants", createRestaurantRouter());
  app.use("/api/branches", createBranchRouter());
  app.use("/api/upload", createUploadRouter());

  // Static uploads directory
  app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

  // Global error handler
  app.use(errorHandler);

  return app;
}
