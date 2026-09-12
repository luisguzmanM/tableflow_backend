import { PostgresMenuRepository } from "../infrastructure/PostgresMenuRepository";
import { menuBroadcaster } from "../infrastructure/WebSocketMenuBroadcaster";

export interface ToggleAvailabilityInput {
  menuItemId: string;
  available: boolean;
}

export class ToggleMenuItemAvailability {
  constructor(private readonly menuRepository: PostgresMenuRepository) {}

  async execute(input: ToggleAvailabilityInput): Promise<void> {
    const item = await this.menuRepository.findMenuItemById(input.menuItemId);
    if (!item) {
      const error = new Error("Menu item not found");
      (error as any).statusCode = 404;
      throw error;
    }

    await this.menuRepository.setItemAvailability(input.menuItemId, input.available);

    const restaurantId = await this.menuRepository.getRestaurantIdByMenuItemId(input.menuItemId);
    if (restaurantId) {
      menuBroadcaster.publishItemAvailabilityChanged({
        restaurantId,
        itemId: input.menuItemId,
        available: input.available,
      });
    }
  }
}
