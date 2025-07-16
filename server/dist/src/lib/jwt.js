"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClearRefreshCookieSettings = exports.getRefreshCookieSettings = exports.verifyRefreshToken = exports.signRefreshToken = exports.getClearCookieSettings = exports.getCookieSettings = exports.verifyJWT = exports.signJWT = void 0;
// server/src/lib/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signJWT = (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m', // 15 minutes for access token
    });
    console.log("🔵 JWT token generated for user:", payload.userId);
    console.log("🔵 JWT expires in:", process.env.JWT_EXPIRES_IN || '15m');
    return token;
};
exports.signJWT = signJWT;
const verifyJWT = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    console.log("🔵 JWT token verified for user:", decoded.userId);
    return decoded;
};
exports.verifyJWT = verifyJWT;
const getCookieSettings = () => {
    const settings = {
        httpOnly: true,
        secure: true, // Always secure for cross-domain
        sameSite: "none", // Allow cross-domain
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
        // Don't set domain for cross-domain cookies
    };
    console.log("🔵 Access token cookie settings:", settings);
    return settings;
};
exports.getCookieSettings = getCookieSettings;
// Settings for clearing cookies (without maxAge to avoid Express deprecation warning)
const getClearCookieSettings = () => {
    const settings = {
        httpOnly: true,
        secure: true, // Always secure for cross-domain
        sameSite: "none", // Allow cross-domain
        path: "/",
        // Don't set domain for cross-domain cookies
    };
    console.log("🔵 Clear cookie settings:", settings);
    return settings;
};
exports.getClearCookieSettings = getClearCookieSettings;
// New function for refresh tokens
const signRefreshToken = (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: '7d', // 7 days for refresh token
    });
    console.log("🔵 Refresh token generated for user:", payload.userId);
    console.log("🔵 Refresh token expires in: 7d");
    return token;
};
exports.signRefreshToken = signRefreshToken;
const verifyRefreshToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    console.log("🔵 Refresh token verified for user:", decoded.userId);
    return decoded;
};
exports.verifyRefreshToken = verifyRefreshToken;
const getRefreshCookieSettings = () => {
    const settings = {
        httpOnly: true,
        secure: true, // Always secure for cross-domain
        sameSite: "none", // Allow cross-domain
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
        // Don't set domain for cross-domain cookies
    };
    console.log("🔵 Refresh token cookie settings:", settings);
    return settings;
};
exports.getRefreshCookieSettings = getRefreshCookieSettings;
// Settings for clearing refresh cookies (without maxAge)
const getClearRefreshCookieSettings = () => {
    const settings = {
        httpOnly: true,
        secure: true, // Always secure for cross-domain
        sameSite: "none", // Allow cross-domain
        path: "/",
        // Don't set domain for cross-domain cookies
    };
    console.log("🔵 Clear refresh cookie settings:", settings);
    return settings;
};
exports.getClearRefreshCookieSettings = getClearRefreshCookieSettings;
