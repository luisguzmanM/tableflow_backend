import { PostgresTableRepository } from "../infrastructure/PostgresTableRepository";

export interface TableDetailsOutput {
  id: string;
  number: number;
  seats: number;
  qrToken: string;
  branch: {
    id: string;
    name: string;
  };
  restaurant: {
    id: string;
    name: string;
  };
}

export class GetTableByQrToken {
  constructor(private readonly tableRepository: PostgresTableRepository) {}

  async execute(qrToken: string): Promise<TableDetailsOutput> {
    const tableContext = await this.tableRepository.findWithContextByQrToken(qrToken);

    if (!tableContext) {
      const error = new Error("Table not found for the provided QR code");
      (error as any).statusCode = 404;
      throw error;
    }

    return {
      id: tableContext.table.id,
      number: tableContext.table.number,
      seats: tableContext.table.seats,
      qrToken: tableContext.table.qrToken,
      branch: {
        id: tableContext.table.branchId,
        name: tableContext.branchName,
      },
      restaurant: {
        id: tableContext.restaurantId,
        name: tableContext.restaurantName,
      },
    };
  }
}
