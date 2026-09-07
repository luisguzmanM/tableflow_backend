import { MenuItem } from "./MenuItem";

export interface CategoryProps {
  id: string;
  menuId: string;
  name: string;
  position?: number;
  items?: MenuItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category {
  readonly id: string;
  readonly menuId: string;
  readonly name: string;
  readonly position: number;
  readonly items: MenuItem[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: CategoryProps) {
    if (!props.menuId) {
      throw new Error("Category must belong to a menu");
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }

    this.id = props.id;
    this.menuId = props.menuId;
    this.name = props.name.trim();
    this.position = props.position ?? 0;
    this.items = props.items ? [...props.items] : [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
