import { UserRepository } from "../domain/UserRepository";
import { UserRole } from "../domain/Role";

export interface CurrentUserDTO {
  id: string;
  restaurantId: string;
  branchId: string;
  name: string;
  email: string;
  role: UserRole;
}

export class GetCurrentUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<CurrentUserDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      restaurantId: user.restaurantId,
      branchId: user.branchId,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
