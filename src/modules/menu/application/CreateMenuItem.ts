import { MenuRepository } from "../domain/MenuRepository";
import { MenuItem } from "../domain/MenuItem";
import { randomUUID } from "crypto";

export interface CreateMenuItemInput {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  available?: boolean;
  position?: number;
}

export class CreateMenuItem {
  constructor(private readonly menuRepository: MenuRepository) {}

  async execute(input: CreateMenuItemInput): Promise<MenuItem> {
    const category = await this.menuRepository.findCategoryById(input.categoryId);
    if (!category) {
      const error = new Error("Category not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const menuItem = new MenuItem({
      id: randomUUID(),
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      image: input.image ?? null,
      available: input.available ?? true,
      position: input.position ?? 0,
    });

    await this.menuRepository.saveMenuItem(menuItem);
    return menuItem;
  }
}
