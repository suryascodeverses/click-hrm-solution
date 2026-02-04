import jwt from "jsonwebtoken";
import { JWTPayload } from "../shared/types/auth.types";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: +process.env.JWT_ACCESS_EXPIRY! * 60 * 1000 || "15m",
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  if (!process.env.JWT_REFRESH_SECRET)
    throw new Error(
      "JWT_REFRESH_SECRET is not defined in environment variables",
    );
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: +process.env.JWT_REFRESH_EXPIRY! * 60 * 1000 || "7d",
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
};
