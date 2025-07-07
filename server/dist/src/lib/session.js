"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const jose_1 = require("jose");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secretKey = process.env.AUTH_SECRET;
if (!secretKey) {
    throw new Error("SESSION_SECRET is not set in environment variables");
}
const encodedKey = new TextEncoder().encode(secretKey);
function encrypt(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return new jose_1.SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(encodedKey);
    });
}
function decrypt() {
    return __awaiter(this, arguments, void 0, function* (session = "") {
        try {
            const { payload } = yield (0, jose_1.jwtVerify)(session, encodedKey, {
                algorithms: ["HS256"],
            });
            return payload;
        }
        catch (error) {
            console.error("Failed to verify session:", error);
            return null;
        }
    });
}
