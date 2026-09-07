import { ModifierGroup } from "./ModifierGroup";

export interface MenuItemProps {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  available?: boolean;
  position?: number;
  modifierGroups?: ModifierGroup[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class MenuItem {
  readonly id: string;
  readonly categoryId: string;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly image: string | null;
  readonly available: boolean;
  readonly position: number;
  readonly modifierGroups: ModifierGroup[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: MenuItemProps) {
    if (!props.categoryId) {
      throw new Error("MenuItem must belong to a category");
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("MenuItem name cannot be empty");
    }
    if (props.price < 0) {
      throw new Error("MenuItem price cannot be negative");
    }

    this.id = props.id;
    this.categoryId = props.categoryId;
    this.name = props.name.trim();
    this.description = props.description ?? null;
    this.price = props.price;
    this.image = props.image ?? null;
    this.available = props.available ?? true;
    this.position = props.position ?? 0;
    this.modifierGroups = props.modifierGroups ? [...props.modifierGroups] : [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
