import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";
import { Table } from "../domain/Table";
import { TableRepository } from "../domain/TableRepository";

export class CreateTable {
  constructor(private readonly tableRepository: TableRepository) {}

  async execute(branchId: string, number: number, seats: number): Promise<Table> {
    const qrToken = crypto.randomBytes(4).toString("hex");

    const table = new Table({
      id: uuidv4(),
      branchId,
      number,
      seats,
      qrToken,
    });

    await this.tableRepository.save(table);

    return table;
  }
}
