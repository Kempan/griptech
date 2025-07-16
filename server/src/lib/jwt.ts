// server/src/lib/jwt.ts
import jwt, { SignOptions } from 'jsonwebtoken';

export interface JWTPayload {
  userId: number;
  email: string;
  roles: string[];
}

export const signJWT = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h', // Reduced to 24 hours for better security
  } as SignOptions);
};

export const verifyJWT = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

export const getCookieSettings = () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Get domain from environment or use default
  const cookieDomain = process.env.COOKIE_DOMAIN;
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: "/",
    ...(cookieDomain && { domain: cookieDomain }), // Set domain for cross-subdomain sharing
  };
};

// Settings for clearing cookies (without maxAge to avoid Express deprecation warning)
export const getClearCookieSettings = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.COOKIE_DOMAIN;
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
    ...(cookieDomain && { domain: cookieDomain }),
  };
};

// New function for refresh tokens
export const signRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!, {
    expiresIn: '7d', // 7 days for refresh token
  } as SignOptions);
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!) as JWTPayload;
};

export const getRefreshCookieSettings = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.COOKIE_DOMAIN;
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
    ...(cookieDomain && { domain: cookieDomain }),
  };
};

// Settings for clearing refresh cookies (without maxAge)
export const getClearRefreshCookieSettings = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.COOKIE_DOMAIN;
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
    ...(cookieDomain && { domain: cookieDomain }),
  };
};