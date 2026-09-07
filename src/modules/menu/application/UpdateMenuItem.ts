import { MenuRepository } from "../domain/MenuRepository";
import { MenuItem } from "../domain/MenuItem";

export interface UpdateMenuItemInput {
  menuItemId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

export class UpdateMenuItem {
  constructor(private readonly menuRepository: MenuRepository) {}

  async execute(input: UpdateMenuItemInput): Promise<MenuItem> {
    const existing = await this.menuRepository.findMenuItemById(input.menuItemId);
    if (!existing) {
      const error = new Error("Menu item not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const category = await this.menuRepository.findCategoryById(input.categoryId);
    if (!category) {
      const error = new Error("Category not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const updatedItem = new MenuItem({
      id: existing.id,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      image: input.image ?? null,
      available: existing.available,
      position: existing.position,
      modifierGroups: existing.modifierGroups,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    await this.menuRepository.saveMenuItem(updatedItem);
    return updatedItem;
  }
}
