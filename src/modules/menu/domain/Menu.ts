import { Category } from "./Category";

export interface MenuProps {
  id: string;
  restaurantId: string;
  categories?: Category[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Menu {
  readonly id: string;
  readonly restaurantId: string;
  readonly categories: Category[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: MenuProps) {
    if (!props.restaurantId) {
      throw new Error("Menu must belong to a restaurant");
    }

    this.id = props.id;
    this.restaurantId = props.restaurantId;
    this.categories = props.categories ? [...props.categories] : [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
