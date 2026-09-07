import { UserRepository } from "../domain/UserRepository";
import { PasswordHasher } from "../domain/PasswordHasher";
import { JwtTokenService } from "../infrastructure/JwtTokenService";
import { UserRole } from "../domain/Role";

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  token: string;
  user: {
    id: string;
    restaurantId: string;
    branchId: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export class LoginUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: JwtTokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const normalizedEmail = input.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      const error = new Error("Invalid email or password");
      (error as any).statusCode = 401;
      throw error;
    }

    const isPasswordValid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      (error as any).statusCode = 401;
      throw error;
    }

    const token = this.tokenService.sign({
      userId: user.id,
      restaurantId: user.restaurantId,
      branchId: user.branchId,
      role: user.role,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        restaurantId: user.restaurantId,
        branchId: user.branchId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
