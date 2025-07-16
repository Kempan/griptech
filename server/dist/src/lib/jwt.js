"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClearRefreshCookieSettings = exports.getRefreshCookieSettings = exports.verifyRefreshToken = exports.signRefreshToken = exports.getClearCookieSettings = exports.getCookieSettings = exports.verifyJWT = exports.signJWT = void 0;
// server/src/lib/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signJWT = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h', // Reduced to 24 hours for better security
    });
};
exports.signJWT = signJWT;
const verifyJWT = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
};
exports.verifyJWT = verifyJWT;
const getCookieSettings = () => {
    const isProduction = process.env.NODE_ENV === "production";
    // Get domain from environment or use default
    const cookieDomain = process.env.COOKIE_DOMAIN;
    return Object.assign({ httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax", maxAge: 24 * 60 * 60 * 1000, path: "/" }, (cookieDomain && { domain: cookieDomain }));
};
exports.getCookieSettings = getCookieSettings;
// Settings for clearing cookies (without maxAge to avoid Express deprecation warning)
const getClearCookieSettings = () => {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain = process.env.COOKIE_DOMAIN;
    return Object.assign({ httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax", path: "/" }, (cookieDomain && { domain: cookieDomain }));
};
exports.getClearCookieSettings = getClearCookieSettings;
// New function for refresh tokens
const signRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: '7d', // 7 days for refresh token
    });
};
exports.signRefreshToken = signRefreshToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
const getRefreshCookieSettings = () => {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain = process.env.COOKIE_DOMAIN;
    return Object.assign({ httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/" }, (cookieDomain && { domain: cookieDomain }));
};
exports.getRefreshCookieSettings = getRefreshCookieSettings;
// Settings for clearing refresh cookies (without maxAge)
const getClearRefreshCookieSettings = () => {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain = process.env.COOKIE_DOMAIN;
    return Object.assign({ httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax", path: "/" }, (cookieDomain && { domain: cookieDomain }));
};
exports.getClearRefreshCookieSettings = getClearRefreshCookieSettings;
