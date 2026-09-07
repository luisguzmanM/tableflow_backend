import { UserRepository } from "../domain/UserRepository";

export class GetUserById {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error(`User not found: ${id}`);
      (error as any).statusCode = 404;
      throw error;
    }
    
    // Sanitize output
    const { passwordHash, ...safeUser } = user as any;
    return safeUser;
  }
}
