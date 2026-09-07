export type UserRole = "ADMIN" | "WAITER" | "KITCHEN" | "CASHIER";

export const USER_ROLES: UserRole[] = ["ADMIN", "WAITER", "KITCHEN", "CASHIER"];

export function isValidRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}
