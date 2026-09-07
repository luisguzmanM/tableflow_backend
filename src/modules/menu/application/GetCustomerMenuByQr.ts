import { MenuRepository } from "../domain/MenuRepository";
import { PostgresTableRepository } from "../../restaurant/infrastructure/PostgresTableRepository";
import { Menu } from "../domain/Menu";

export interface CustomerMenuOutput {
  restaurant: {
    id: string;
    name: string;
  };
  table: {
    id: string;
    number: number;
    seats: number;
    qrToken: string;
    branchName: string;
  };
  menu: Menu | null;
}

export class GetCustomerMenuByQr {
  constructor(
    private readonly tableRepository: PostgresTableRepository,
    private readonly menuRepository: MenuRepository
  ) {}

  async execute(qrToken: string): Promise<CustomerMenuOutput> {
    const tableContext = await this.tableRepository.findWithContextByQrToken(qrToken);

    if (!tableContext) {
      const error = new Error("Table not found for QR token");
      (error as any).statusCode = 404;
      throw error;
    }

    const menu = await this.menuRepository.findByRestaurantId(tableContext.restaurantId);

    return {
      restaurant: {
        id: tableContext.restaurantId,
        name: tableContext.restaurantName,
      },
      table: {
        id: tableContext.table.id,
        number: tableContext.table.number,
        seats: tableContext.table.seats,
        qrToken: tableContext.table.qrToken,
        branchName: tableContext.branchName,
      },
      menu,
    };
  }
}
