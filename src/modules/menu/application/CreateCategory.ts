import { MenuRepository } from "../domain/MenuRepository";
import { Category } from "../domain/Category";
import { randomUUID } from "crypto";

export interface CreateCategoryInput {
  restaurantId: string;
  name: string;
  position?: number;
}

export class CreateCategory {
  constructor(private readonly menuRepository: MenuRepository) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const menu = await this.menuRepository.findByRestaurantId(input.restaurantId);

    if (!menu) {
      const error = new Error("Menu not found for restaurant");
      (error as any).statusCode = 404;
      throw error;
    }

    const category = new Category({
      id: randomUUID(),
      menuId: menu.id,
      name: input.name,
      position: input.position ?? menu.categories.length + 1,
    });

    await this.menuRepository.saveCategory(category);
    return category;
  }
}
