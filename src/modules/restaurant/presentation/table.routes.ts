import { Router } from "express";
import { TableController } from "./table.controller";
import { GetTableByQrToken } from "../application/GetTableByQrToken";
import { ListBranchTables } from "../application/ListBranchTables";
import { CreateTable } from "../application/CreateTable";
import { RegenerateTableQr } from "../application/RegenerateTableQr";
import { PostgresTableRepository } from "../infrastructure/PostgresTableRepository";
import { requireAuth } from "../../auth/presentation/auth.middleware";

export function createTableRouter(): Router {
  const router = Router();

  const tableRepository = new PostgresTableRepository();
  const getTableByQrTokenUseCase = new GetTableByQrToken(tableRepository);
  const listBranchTablesUseCase = new ListBranchTables(tableRepository);
  const createTableUseCase = new CreateTable(tableRepository);
  const regenerateTableQrUseCase = new RegenerateTableQr(tableRepository);

  const tableController = new TableController(
    getTableByQrTokenUseCase,
    listBranchTablesUseCase,
    createTableUseCase,
    regenerateTableQrUseCase
  );

  // Public endpoint: Scan table QR
  router.get("/qr/:qrToken", tableController.getByQr);

  // Protected endpoint: List tables in employee's branch
  router.get("/", requireAuth, tableController.listForBranch);

  // Protected endpoint: Create table
  router.post("/", requireAuth, tableController.createTable);

  // Protected endpoint: Regenerate QR for table
  router.post("/:id/qr/regenerate", requireAuth, tableController.regenerateQr);

  return router;
}
