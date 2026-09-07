import { Menu } from "./Menu";
import { Category } from "./Category";
import { MenuItem } from "./MenuItem";

export interface MenuRepository {
  findByRestaurantId(restaurantId: string): Promise<Menu | null>;
  findCategoryById(categoryId: string): Promise<Category | null>;
  findMenuItemById(menuItemId: string): Promise<MenuItem | null>;
  saveMenu(menu: Menu): Promise<void>;
  saveCategory(category: Category): Promise<void>;
  saveMenuItem(menuItem: MenuItem): Promise<void>;
  deleteMenuItem(menuItemId: string): Promise<void>;
}
