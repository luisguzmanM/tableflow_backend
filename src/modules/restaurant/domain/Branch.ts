export interface BranchProps {
  id: string;
  restaurantId: string;
  name: string;
  address?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Branch {
  readonly id: string;
  readonly restaurantId: string;
  readonly name: string;
  readonly address: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: BranchProps) {
    if (!props.restaurantId) {
      throw new Error("Branch must belong to a restaurant");
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Branch name cannot be empty");
    }
    this.id = props.id;
    this.restaurantId = props.restaurantId;
    this.name = props.name.trim();
    this.address = props.address ?? null;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
