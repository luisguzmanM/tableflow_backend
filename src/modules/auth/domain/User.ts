import { UserRole, isValidRole } from "./Role";

export interface UserProps {
  id: string;
  restaurantId: string;
  branchId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  readonly id: string;
  readonly restaurantId: string;
  readonly branchId: string;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserProps) {
    if (!props.restaurantId) {
      throw new Error("User must belong to a restaurant");
    }
    if (!props.branchId) {
      throw new Error("User must belong to a branch");
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("User name cannot be empty");
    }
    if (!props.email || !props.email.includes("@")) {
      throw new Error("User must have a valid email address");
    }
    if (!isValidRole(props.role)) {
      throw new Error(`Invalid user role: ${props.role}`);
    }
    if (!props.passwordHash) {
      throw new Error("User password hash cannot be empty");
    }

    this.id = props.id;
    this.restaurantId = props.restaurantId;
    this.branchId = props.branchId;
    this.name = props.name.trim();
    this.email = props.email.toLowerCase().trim();
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
