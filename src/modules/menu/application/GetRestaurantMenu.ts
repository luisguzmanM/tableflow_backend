import { MenuRepository } from "../domain/MenuRepository";
import { Menu } from "../domain/Menu";

export class GetRestaurantMenu {
  constructor(private readonly menuRepository: MenuRepository) {}

  async execute(restaurantId: string): Promise<Menu | null> {
    return this.menuRepository.findByRestaurantId(restaurantId);
  }
}
