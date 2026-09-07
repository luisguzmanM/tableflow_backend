import { BranchRepository } from "../domain/RestaurantRepository";
import { Branch } from "../domain/Branch";

export class ListBranches {
  constructor(private readonly branchRepository: BranchRepository) {}

  async execute(restaurantId: string): Promise<Branch[]> {
    return this.branchRepository.findByRestaurantId(restaurantId);
  }
}
