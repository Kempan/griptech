import { SignJWT, jwtVerify } from "jose";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.AUTH_SECRET;
if (!secretKey) {
	throw new Error("SESSION_SECRET is not set in environment variables");
}

const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
	try {
		const { payload } = await jwtVerify(session, encodedKey, {
			algorithms: ["HS256"],
		});
		return payload;
	} catch (error) {
		console.error("Failed to verify session:", error);
		return null;
	}
}
