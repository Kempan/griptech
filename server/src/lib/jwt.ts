// server/src/lib/jwt.ts
import jwt, { SignOptions } from 'jsonwebtoken';

export interface JWTPayload {
  userId: number;
  email: string;
  roles: string[];
}

export const signJWT = (payload: JWTPayload): string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m', // 15 minutes for access token
  } as SignOptions);
  
  console.log("🔵 JWT token generated for user:", payload.userId);
  console.log("🔵 JWT expires in:", process.env.JWT_EXPIRES_IN || '15m');
  
  return token;
};

export const verifyJWT = (token: string): JWTPayload => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  console.log("🔵 JWT token verified for user:", decoded.userId);
  return decoded;
};

export const getCookieSettings = () => {
  const settings = {
    httpOnly: true,
    secure: true, // Always secure for cross-domain
    sameSite: "none" as const, // Allow cross-domain
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
    // Don't set domain for cross-domain cookies
  };
  
  console.log("🔵 Access token cookie settings:", settings);
  return settings;
};

// Settings for clearing cookies (without maxAge to avoid Express deprecation warning)
export const getClearCookieSettings = () => {
  const settings = {
    httpOnly: true,
    secure: true, // Always secure for cross-domain
    sameSite: "none" as const, // Allow cross-domain
    path: "/",
    // Don't set domain for cross-domain cookies
  };
  
  console.log("🔵 Clear cookie settings:", settings);
  return settings;
};

// New function for refresh tokens
export const signRefreshToken = (payload: JWTPayload): string => {
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!, {
    expiresIn: '7d', // 7 days for refresh token
  } as SignOptions);
  
  console.log("🔵 Refresh token generated for user:", payload.userId);
  console.log("🔵 Refresh token expires in: 7d");
  
  return token;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!) as JWTPayload;
  console.log("🔵 Refresh token verified for user:", decoded.userId);
  return decoded;
};

export const getRefreshCookieSettings = () => {
  const settings = {
    httpOnly: true,
    secure: true, // Always secure for cross-domain
    sameSite: "none" as const, // Allow cross-domain
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
    // Don't set domain for cross-domain cookies
  };
  
  console.log("🔵 Refresh token cookie settings:", settings);
  return settings;
};

// Settings for clearing refresh cookies (without maxAge)
export const getClearRefreshCookieSettings = () => {
  const settings = {
    httpOnly: true,
    secure: true, // Always secure for cross-domain
    sameSite: "none" as const, // Allow cross-domain
    path: "/",
    // Don't set domain for cross-domain cookies
  };
  
  console.log("🔵 Clear refresh cookie settings:", settings);
  return settings;
};