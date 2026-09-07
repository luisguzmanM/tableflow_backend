import { UserRepository } from "../domain/UserRepository";

export class ListBranchEmployees {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(branchId: string) {
    const users = await this.userRepository.findByBranchId(branchId);
    // Sanitize user data before returning
    return users.map(user => {
      const { passwordHash, ...safeUser } = user as any;
      return safeUser;
    });
  }
}
