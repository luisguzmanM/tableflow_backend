import { Request, Response, NextFunction } from "express";
import { JwtTokenService, TokenPayload } from "../infrastructure/JwtTokenService";
import { UserRole } from "../domain/Role";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

const tokenService = new JwtTokenService();

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = tokenService.verify(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: insufficient role permissions" });
      return;
    }

    next();
  };
}
