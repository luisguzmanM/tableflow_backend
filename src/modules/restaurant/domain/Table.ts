export interface TableProps {
  id: string;
  branchId: string;
  number: number;
  seats?: number;
  qrToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Table {
  readonly id: string;
  readonly branchId: string;
  readonly number: number;
  readonly seats: number;
  readonly qrToken: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: TableProps) {
    if (!props.branchId) {
      throw new Error("Table must belong to a branch");
    }
    if (!Number.isInteger(props.number) || props.number <= 0) {
      throw new Error("Table number must be a positive integer");
    }
    if (!props.qrToken || props.qrToken.trim().length === 0) {
      throw new Error("Table must have a valid QR token");
    }

    this.id = props.id;
    this.branchId = props.branchId;
    this.number = props.number;
    this.seats = props.seats ?? 4;
    this.qrToken = props.qrToken.trim();
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
