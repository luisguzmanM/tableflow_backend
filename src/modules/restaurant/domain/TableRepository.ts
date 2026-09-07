import { Table } from "./Table";

export interface TableRepository {
  findById(id: string): Promise<Table | null>;
  findByQrToken(qrToken: string): Promise<Table | null>;
  findByBranchId(branchId: string): Promise<Table[]>;
  save(table: Table): Promise<void>;
}
