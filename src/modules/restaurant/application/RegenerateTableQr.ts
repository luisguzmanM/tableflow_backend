import * as crypto from "crypto";
import { Table } from "../domain/Table";
import { TableRepository } from "../domain/TableRepository";

export class RegenerateTableQr {
  constructor(private readonly tableRepository: TableRepository) {}

  async execute(tableId: string): Promise<Table> {
    const table = await this.tableRepository.findById(tableId);
    
    if (!table) {
      throw new Error("Table not found");
    }

    const newQrToken = crypto.randomBytes(4).toString("hex");

    const updatedTable = new Table({
      id: table.id,
      branchId: table.branchId,
      number: table.number,
      seats: table.seats,
      qrToken: newQrToken,
      createdAt: table.createdAt,
    });

    await this.tableRepository.save(updatedTable);

    return updatedTable;
  }
}
