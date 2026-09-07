import { Response, NextFunction } from "express";
import { GetTableByQrToken } from "../application/GetTableByQrToken";
import { ListBranchTables } from "../application/ListBranchTables";
import { CreateTable } from "../application/CreateTable";
import { RegenerateTableQr } from "../application/RegenerateTableQr";
import { AuthenticatedRequest } from "../../auth/presentation/auth.middleware";

export class TableController {
  constructor(
    private readonly getTableByQrToken: GetTableByQrToken,
    private readonly listBranchTables: ListBranchTables,
    private readonly createTableUseCase: CreateTable,
    private readonly regenerateTableQrUseCase: RegenerateTableQr
  ) {}

  getByQr = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { qrToken } = req.params;
      const result = await this.getTableByQrToken.execute(qrToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listForBranch = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const tables = await this.listBranchTables.execute(req.user.branchId);
      res.status(200).json({ tables });
    } catch (error) {
      next(error);
    }
  };

  createTable = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const { number, seats } = req.body;
      const table = await this.createTableUseCase.execute(req.user.branchId, number, seats);
      res.status(201).json({ table });
    } catch (error) {
      next(error);
    }
  };

  regenerateQr = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }
      const { id } = req.params;
      const table = await this.regenerateTableQrUseCase.execute(id);
      res.status(200).json({ table });
    } catch (error) {
      next(error);
    }
  };
}
