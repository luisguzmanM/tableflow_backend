import { RestaurantRepository } from "../domain/RestaurantRepository";
import { Restaurant } from "../domain/Restaurant";

export class GetRestaurantById {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async execute(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findById(id);
    if (!restaurant) {
      const error = new Error(`Restaurant not found: ${id}`);
      (error as any).statusCode = 404;
      throw error;
    }
    return restaurant;
  }
}
