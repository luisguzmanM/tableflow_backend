import { TableRepository } from "../domain/TableRepository"

export interface BranchTableItem {
  id: string;
  number: number;
  seats: number;
  qrToken: string;
}

export class ListBranchTables {
  constructor(private readonly tableRepository: TableRepository) {}

  async execute(branchId: string): Promise<BranchTableItem[]> {
    const tables = await this.tableRepository.findByBranchId(branchId);

    return tables.map((t) => ({
      id: t.id,
      number: t.number,
      seats: t.seats,
      qrToken: t.qrToken,
    }));
  }
}
