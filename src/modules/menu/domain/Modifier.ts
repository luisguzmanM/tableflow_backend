export interface ModifierProps {
  id: string;
  modifierGroupId: string;
  name: string;
  price: number;
  available?: boolean;
  position?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Modifier {
  readonly id: string;
  readonly modifierGroupId: string;
  readonly name: string;
  readonly price: number;
  readonly available: boolean;
  readonly position: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ModifierProps) {
    if (!props.modifierGroupId) {
      throw new Error("Modifier must belong to a modifier group");
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Modifier name cannot be empty");
    }
    if (props.price < 0) {
      throw new Error("Modifier price cannot be negative");
    }

    this.id = props.id;
    this.modifierGroupId = props.modifierGroupId;
    this.name = props.name.trim();
    this.price = props.price;
    this.available = props.available ?? true;
    this.position = props.position ?? 0;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
