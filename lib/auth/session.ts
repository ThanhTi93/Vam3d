import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_that_is_at_least_32_characters_long_for_safety";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Encrypts a payload into a JWT session token.
 * Expired in 7 days by default.
 */
export async function encryptSession(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Decrypts and verifies a JWT session token.
 * Returns the decoded payload or null if verification fails.
 */
export async function decryptSession(token: string): Promise<any | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("JWT Verification failed:", error);
    return null;
  }
}
