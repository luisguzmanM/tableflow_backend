import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import { PostgresUserRepository } from "../../src/modules/auth/infrastructure/PostgresUserRepository";
import { BcryptPasswordHasher } from "../../src/modules/auth/infrastructure/BcryptPasswordHasher";
import { JwtTokenService } from "../../src/modules/auth/infrastructure/JwtTokenService";
import { User } from "../../src/modules/auth/domain/User";

describe("Auth API Integration", () => {
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();

  const mockAdminUser = new User({
    id: "usr-admin-1",
    restaurantId: "rest-1",
    branchId: "branch-1",
    name: "Admin User",
    email: "admin@oliveandember.com",
    passwordHash: "$2b$10$epR3Y0p20.G1sU1Q1n38a.n8ZJ59aW5v5x582G54P9Kz4R4sVb12W",
    role: "ADMIN",
  });

  it("should fail validation on invalid payload", async () => {
    const app = createApp();
    const response = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details).toBeDefined();
  });

  it("should authenticate and return JWT token for valid credentials", async () => {
    vi.spyOn(PostgresUserRepository.prototype, "findByEmail").mockResolvedValue(mockAdminUser);
    vi.spyOn(BcryptPasswordHasher.prototype, "compare").mockResolvedValue(true);

    const app = createApp();
    const response = await request(app).post("/api/auth/login").send({
      email: "admin@oliveandember.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe("admin@oliveandember.com");
    expect(response.body.user.role).toBe("ADMIN");
  });

  it("should return current user profile on /api/auth/me with valid Bearer token", async () => {
    vi.spyOn(PostgresUserRepository.prototype, "findById").mockResolvedValue(mockAdminUser);

    const token = tokenService.sign({
      userId: mockAdminUser.id,
      restaurantId: mockAdminUser.restaurantId,
      branchId: mockAdminUser.branchId,
      role: mockAdminUser.role,
      email: mockAdminUser.email,
    });

    const app = createApp();
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe(mockAdminUser.id);
    expect(response.body.user.name).toBe("Admin User");
  });

  it("should reject unauthenticated request on protected route", async () => {
    const app = createApp();
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Missing or invalid authorization token");
  });
});
