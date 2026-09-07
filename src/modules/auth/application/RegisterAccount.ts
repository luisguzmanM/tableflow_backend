import { PasswordHasher } from "../domain/PasswordHasher";
import { JwtTokenService } from "../infrastructure/JwtTokenService";
import { AccountRegistrar } from "../domain/AccountRegistrar";
import { UserRepository } from "../domain/UserRepository";
import { UserRole } from "../domain/Role";

export interface RegisterAccountInput {
  restaurantName: string;
  adminName: string;
  email: string;
  password: string;
}

export interface RegisterAccountOutput {
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

export class RegisterAccount {
  constructor(
    private readonly accountRegistrar: AccountRegistrar,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: JwtTokenService
  ) {}

  async execute(input: RegisterAccountInput): Promise<RegisterAccountOutput> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      const error = new Error("Email already in use");
      (error as any).statusCode = 409;
      throw error;
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = await this.accountRegistrar.registerAccount({
      restaurantName: input.restaurantName,
      adminName: input.adminName,
      adminEmail: normalizedEmail,
      adminPasswordHash: passwordHash,
    });

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
