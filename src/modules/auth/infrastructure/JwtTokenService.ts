import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../../../shared/config/env";
import { UserRole } from "../domain/Role";

export interface TokenPayload {
  userId: string;
  restaurantId: string;
  branchId: string;
  role: UserRole;
  email: string;
}

export class JwtTokenService {
  private readonly secret: Secret = config.jwtSecret;
  private readonly expiresIn = config.jwtExpiresIn;

  sign(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as SignOptions["expiresIn"],
    };
    return jwt.sign(payload, this.secret, options);
  }

  verify(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as TokenPayload;
  }
}
