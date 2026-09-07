import { describe, it, expect } from "vitest";
import { User } from "../../src/modules/auth/domain/User";

describe("Auth User Domain Entity", () => {
  it("should create valid user with role and branch", () => {
    const user = new User({
      id: "usr-1",
      restaurantId: "rest-1",
      branchId: "branch-1",
      name: "Chef Marco",
      email: "MARCO@restaurant.com",
      passwordHash: "somehash",
      role: "KITCHEN",
    });

    expect(user.role).toBe("KITCHEN");
    expect(user.email).toBe("marco@restaurant.com"); // Normalized to lowercase
  });

  it("should reject invalid email or role", () => {
    expect(() => {
      new User({
        id: "usr-1",
        restaurantId: "rest-1",
        branchId: "branch-1",
        name: "Chef Marco",
        email: "invalid-email",
        passwordHash: "somehash",
        role: "KITCHEN",
      });
    }).toThrow("User must have a valid email address");

    expect(() => {
      new User({
        id: "usr-1",
        restaurantId: "rest-1",
        branchId: "branch-1",
        name: "Chef Marco",
        email: "marco@test.com",
        passwordHash: "somehash",
        // @ts-expect-error test invalid role
        role: "SUPER_ADMIN",
      });
    }).toThrow("Invalid user role");
  });
});
