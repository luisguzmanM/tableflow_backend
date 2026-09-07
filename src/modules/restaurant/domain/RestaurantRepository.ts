import { Restaurant } from "./Restaurant";
import { Branch } from "./Branch";

export interface RestaurantRepository {
  findById(id: string): Promise<Restaurant | null>;
  save(restaurant: Restaurant): Promise<void>;
}

export interface BranchRepository {
  findById(id: string): Promise<Branch | null>;
  findByRestaurantId(restaurantId: string): Promise<Branch[]>;
  save(branch: Branch): Promise<void>;
}
