import { User } from "./User";

export interface AccountRegistrationData {
  restaurantName: string;
  adminName: string;
  adminEmail: string;
  adminPasswordHash: string;
}

export interface AccountRegistrar {
  registerAccount(data: AccountRegistrationData): Promise<User>;
}
