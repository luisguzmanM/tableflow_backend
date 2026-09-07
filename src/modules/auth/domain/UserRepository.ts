import { User } from "./User";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByBranchId(branchId: string): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
