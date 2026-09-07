import { RestaurantRepository } from "../domain/RestaurantRepository";
import { Restaurant } from "../domain/Restaurant";

export interface UpdateRestaurantInput {
  name?: string;
  currency?: string;
  acceptOrders?: boolean;
  askTip?: boolean;
  tagline?: string;
  serviceHours?: string;
}

export class UpdateRestaurant {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(id: string, input: UpdateRestaurantInput): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      const error = new Error(`Restaurant not found: ${id}`);
      (error as any).statusCode = 404;
      throw error;
    }

    // In a real CQRS/DDD this would be methods on the aggregate,
    // but the current Restaurant domain model might not have them.
    // Let's check what Restaurant.ts actually exports or just reconstruct it.
    
    const updated = new Restaurant({
      id: restaurant.id,
      name: input.name ?? restaurant.name,
      tagline: input.tagline !== undefined ? input.tagline : restaurant.tagline,
      currency: input.currency ?? restaurant.currency,
      serviceHours: input.serviceHours !== undefined ? input.serviceHours : restaurant.serviceHours,
      acceptOrders: input.acceptOrders ?? restaurant.acceptOrders,
      askTip: input.askTip ?? restaurant.askTip,
      createdAt: restaurant.createdAt,
    });

    await this.restaurantRepository.save(updated);
    return updated;
  }
}
