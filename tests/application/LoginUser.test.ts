import { describe, it, expect, vi } from "vitest";
import { LoginUser } from "../../src/modules/auth/application/LoginUser";
import { UserRepository } from "../../src/modules/auth/domain/UserRepository";
import { PasswordHasher } from "../../src/modules/auth/domain/PasswordHasher";
import { JwtTokenService } from "../../src/modules/auth/infrastructure/JwtTokenService";
import { User } from "../../src/modules/auth/domain/User";

describe("LoginUser Use Case", () => {
  const mockUser = new User({
    id: "usr-123",
    restaurantId: "rest-1",
    branchId: "branch-1",
    name: "Admin",
    email: "admin@test.com",
    passwordHash: "hashed_pwd",
    role: "ADMIN",
  });

  const mockUserRepository: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByBranchId: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const mockPasswordHasher: PasswordHasher = {
    hash: vi.fn(),
    compare: vi.fn(),
  };

  const tokenService = new JwtTokenService();

  it("should authenticate valid credentials and return JWT token", async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);

    const loginUser = new LoginUser(mockUserRepository, mockPasswordHasher, tokenService);
    const result = await loginUser.execute({
      email: "admin@test.com",
      password: "valid_password",
    });

    expect(result.token).toBeDefined();
    expect(result.user.id).toBe("usr-123");
    expect(result.user.role).toBe("ADMIN");
  });

  it("should throw 401 when email is not found", async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

    const loginUser = new LoginUser(mockUserRepository, mockPasswordHasher, tokenService);
    await expect(
      loginUser.execute({ email: "notfound@test.com", password: "pwd" })
    ).rejects.toThrow("Invalid email or password");
  });

  it("should throw 401 when password does not match", async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(mockPasswordHasher.compare).mockResolvedValue(false);

    const loginUser = new LoginUser(mockUserRepository, mockPasswordHasher, tokenService);
    await expect(
      loginUser.execute({ email: "admin@test.com", password: "wrong_password" })
    ).rejects.toThrow("Invalid email or password");
  });
});
