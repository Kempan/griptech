// server/src/lib/jwt.ts
import jwt, { SignOptions } from 'jsonwebtoken';

export interface JWTPayload {
  userId: number;
  email: string;
  roles: string[];
}

export const signJWT = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as SignOptions);
};

export const verifyJWT = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

export const getCookieSettings = () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};